const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Connection, Keypair, BpfLoader, BPF_LOADER_PROGRAM_ID } = require('@solana/web3.js');

function findSoPath() {
  // Prefer SBF path first
  const sbf = path.resolve('contracts/solana/safetx-program/target/sbf-solana-solana/release/safetx_program.so');
  if (fs.existsSync(sbf)) return sbf;
  // Legacy path
  const bpf = path.resolve('contracts/solana/safetx-program/target/bpfel-unknown-unknown/release/safetx_program.so');
  if (fs.existsSync(bpf)) return bpf;
  throw new Error('Compiled .so not found. Build first: cd "contracts/solana/safetx-program" && cargo build-sbf');
}

function writeProgramId(programId) {
  const readmePath = path.resolve('contracts/solana/README.md');
  const pidPath = path.resolve('contracts/solana/PROGRAM_ID');

  // Write PROGRAM_ID file
  fs.writeFileSync(pidPath, programId.trim() + '\n');

  let readme = fs.readFileSync(readmePath, 'utf-8');
  const line = `Deployed Program ID: ${programId}`;
  if (readme.includes('Deployed Program ID:')) {
    readme = readme.replace(/Deployed Program ID: .*/g, line);
  } else {
    // Insert after first heading
    const idx = readme.indexOf('\n');
    readme = readme.slice(0, idx + 1) + '\n' + line + '\n\n' + readme.slice(idx + 1);
  }
  fs.writeFileSync(readmePath, readme, 'utf-8');
  console.log('📝 Updated', path.relative(process.cwd(), readmePath));
  console.log('📝 Wrote', path.relative(process.cwd(), pidPath));
}

function hasSolanaCli() {
  try {
    const out = execSync('solana --version', { stdio: ['ignore', 'pipe', 'ignore'], shell: true, windowsHide: true });
    return /solana-cli/.test(out.toString()) || /solana/.test(out.toString());
  } catch {
    return false;
  }
}

function deployWithCli(soAbsPath) {
  console.log('🚀 Deploying with Solana CLI...');
  // Quote path for Windows safety
  const cmd = `solana program deploy --url https://api.testnet.solana.com "${soAbsPath}"`;
  const out = execSync(cmd, { encoding: 'utf-8', shell: true, windowsHide: true });
  console.log(out);
  const match = out.match(/Program Id: ([A-Za-z0-9]{32,44})/i) || out.match(/program id: ([A-Za-z0-9]{32,44})/i);
  if (!match) throw new Error('Could not parse Program Id from CLI output.');
  return match[1];
}

(async function main() {
  try {
    const argPid = process.argv[2];
    if (argPid) {
      writeProgramId(argPid);
      console.log('✅ Recorded Program ID from argument:', argPid);
      return;
    }

    const soPath = findSoPath();
    console.log('📦 Program file:', soPath);

    if (!hasSolanaCli()) {
      console.log('❗ Solana CLI not found. Attempting web3.js BpfLoader deploy (non-upgradeable)...');
  const connection = new Connection('https://api.testnet.solana.com', 'confirmed');
  // Load payer from SOLANA_KEYPAIR or default id.json
  const home = process.env.HOME || process.env.USERPROFILE || '';
  const defaultKey = path.join(home, '.config', 'solana', 'id.json');
  const keyPath = process.env.SOLANA_KEYPAIR ? path.resolve(process.env.SOLANA_KEYPAIR) : defaultKey;
  const secretKey = JSON.parse(fs.readFileSync(keyPath, 'utf-8'));
      const payer = Keypair.fromSecretKey(Buffer.from(secretKey));

      const data = fs.readFileSync(soPath);
      console.log('📏 Program size:', data.length, 'bytes');
      console.log('💳 Payer:', payer.publicKey.toString());
      const lamports = await connection.getBalance(payer.publicKey);
      console.log('💰 Balance:', (lamports / 1e9).toFixed(3), 'SOL');

      const programId = await BpfLoader.load(connection, payer, data, BPF_LOADER_PROGRAM_ID);
      console.log('✅ Program deployed via BpfLoader:', programId.toString());
      writeProgramId(programId.toString());
      return;
    }

    const programId = deployWithCli(soPath);
    console.log('✅ Program deployed:', programId);
    writeProgramId(programId);
  } catch (err) {
    console.error('❌ Deployment script error:', err.message || err);
    process.exit(1);
  }
})();
