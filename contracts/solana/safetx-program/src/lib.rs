//! SafeTx Program
//! Stores network metrics snapshots in a compact ring buffer and exposes
//! a minimal instruction set suitable for dashboards.

use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    borsh1::try_from_slice_unchecked,
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::{invoke_signed},
    program_error::ProgramError,
    pubkey::Pubkey,
    system_instruction,
    sysvar::{rent::Rent, Sysvar},
};

entrypoint!(process_instruction);

// Program constants
pub const METRIC_CAPACITY: u16 = 256; // ring buffer length

#[derive(BorshSerialize, BorshDeserialize, Clone, Copy, Debug)]
pub struct MetricSnapshot {
    pub tps: u32,
    pub slot: u64,
    pub slot_time_ms: u32,
    pub success_bps: u16, // success rate in basis points (e.g., 9876 = 98.76%)
    pub ts: u64,          // unix millis (u64 for simpler client encoding)
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct Registry {
    pub admin: Pubkey,       // authority allowed to push snapshots
    pub bump: u8,            // PDA bump
    pub head: u16,           // next write index
    pub count: u16,          // how many filled (<= capacity)
    pub capacity: u16,       // ring capacity (constant)
    pub reserved: [u8; 5],   // padding for alignment
    pub buffer: [MetricSnapshot; METRIC_CAPACITY as usize],
}

impl Registry {
    pub fn size_of() -> usize {
        // admin(32) + bump(1) + head(2) + count(2) + capacity(2) + reserved(5) + buffer
        32 + 1 + 2 + 2 + 2 + 5 + core::mem::size_of::<MetricSnapshot>() * METRIC_CAPACITY as usize
    }
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum SafetxIx {
    InitRegistry, // creates PDA and initializes
    PushMetric(MetricSnapshot),
}

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    data: &[u8],
) -> ProgramResult {
    let ix = SafetxIx::try_from_slice(data).map_err(|_| ProgramError::InvalidInstructionData)?;

    match ix {
        SafetxIx::InitRegistry => init_registry(program_id, accounts),
        SafetxIx::PushMetric(s) => push_metric(program_id, accounts, s),
    }
}

fn init_registry(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let acc_iter = &mut accounts.iter();
    let admin = next_account_info(acc_iter)?; // signer who becomes admin
    let registry = next_account_info(acc_iter)?; // PDA to be created
    let system_program = next_account_info(acc_iter)?;

    if !admin.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Derive PDA: seeds = [b"safetx", admin]
    let (pda, bump) = Pubkey::find_program_address(&[b"safetx", admin.key.as_ref()], program_id);
    if pda != *registry.key {
        msg!("Registry PDA mismatch");
        return Err(ProgramError::InvalidSeeds);
    }

    // Create account if not already existing
    if registry.lamports() == 0 {
        let rent = Rent::get()?;
        let space = Registry::size_of();
        let lamports = rent.minimum_balance(space);

        let create_ix = system_instruction::create_account(
            admin.key,
            registry.key,
            lamports,
            space as u64,
            program_id,
        );

        invoke_signed(
            &create_ix,
            &[admin.clone(), registry.clone(), system_program.clone()],
            &[&[b"safetx", admin.key.as_ref(), &[bump]]],
        )?;
    }

    // Initialize data
    let mut state: Registry = try_from_slice_unchecked(&registry.data.borrow())?;
    state.admin = *admin.key;
    state.bump = bump;
    state.head = 0;
    state.count = 0;
    state.capacity = METRIC_CAPACITY;
    state.reserved = [0; 5];
    // buffer left zeroed
    state.serialize(&mut &mut registry.data.borrow_mut()[..])?;

    msg!("SafeTx registry initialized. capacity={}", METRIC_CAPACITY);
    Ok(())
}

fn push_metric(program_id: &Pubkey, accounts: &[AccountInfo], s: MetricSnapshot) -> ProgramResult {
    let acc_iter = &mut accounts.iter();
    let admin = next_account_info(acc_iter)?; // must sign
    let registry = next_account_info(acc_iter)?; // PDA

    if !admin.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Check PDA
    let (pda, _bump) = Pubkey::find_program_address(&[b"safetx", admin.key.as_ref()], program_id);
    if pda != *registry.key {
        msg!("Registry PDA mismatch");
        return Err(ProgramError::InvalidSeeds);
    }

    let mut state: Registry = try_from_slice_unchecked(&registry.data.borrow())?;

    // Only admin can push
    if state.admin != *admin.key {
        return Err(ProgramError::IllegalOwner);
    }

    let idx = state.head as usize % state.capacity as usize;
    state.buffer[idx] = s;
    state.head = state.head.wrapping_add(1);
    if state.count < state.capacity { state.count += 1; }

    state.serialize(&mut &mut registry.data.borrow_mut()[..])?;
    msg!("Pushed metric at idx {} (head={})", idx, state.head);
    Ok(())
}
