const { Connection, PublicKey, Keypair, clusterApiUrl } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

function getSolanaConfigDir() {
  const home = process.env.HOME || process.env.USERPROFILE || process.env.USERHOME || '';
  return path.join(home, '.config', 'solana');
}

async function checkBalance(address, rpcUrl) {
  const endpoint = rpcUrl || 'https://api.testnet.solana.com';
  const connection = new Connection(endpoint, 'confirmed');
  const pubkey = new PublicKey(address);
  const lamports = await connection.getBalance(pubkey);
  return lamports / 1e9;
}

(async function main() {
  try {
    const args = process.argv.slice(2);
    let address = args[0];
    const rpcUrl = args[1];

    if (!address) {
      // Fallback to local id.json if no address passed
      const keyPath = path.join(getSolanaConfigDir(), 'id.json');
      const secretKey = JSON.parse(fs.readFileSync(keyPath));
      const keypair = Keypair.fromSecretKey(Buffer.from(secretKey));
      address = keypair.publicKey.toString();
    }

    const sol = await checkBalance(address, rpcUrl);
    console.log('🔑 Address:', address);
    console.log('💰 Balance:', sol, 'SOL');
    console.log('🌐 RPC:', rpcUrl || 'https://api.testnet.solana.com');
  } catch (err) {
    console.error('❌ Error:', err?.message || err);
    process.exit(1);
  }
})();
