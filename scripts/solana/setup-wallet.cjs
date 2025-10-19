const { Keypair } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

function getSolanaConfigDir() {
  const home = process.env.HOME || process.env.USERPROFILE || process.env.USERHOME || '';
  // Match Solana CLI default on Windows and Unix
  return path.join(home, '.config', 'solana');
}

(function main() {
  try {
    const solanaDir = getSolanaConfigDir();
    if (!fs.existsSync(solanaDir)) {
      fs.mkdirSync(solanaDir, { recursive: true });
    }

    const keypair = Keypair.generate();
    const secretKey = Array.from(keypair.secretKey);
    const keyPath = path.join(solanaDir, 'id.json');
    fs.writeFileSync(keyPath, JSON.stringify(secretKey));

    console.log('✅ Wallet created!');
    console.log('🔑 Public Key:', keypair.publicKey.toString());
    console.log('📁 Saved to:', keyPath);
    console.log('\nTip: Airdrop on testnet/devnet using https://faucet.solana.com/');
  } catch (err) {
    console.error('❌ Failed to create wallet:', err?.message || err);
    process.exit(1);
  }
})();
