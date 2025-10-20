const fs = require('fs');
const path = require('path');

function getSolanaConfigDir() {
  const home = process.env.HOME || process.env.USERPROFILE || process.env.USERHOME || '';
  return path.join(home, '.config', 'solana');
}

(function main() {
  try {
    const src = process.argv[2];
    if (!src) {
      console.error('Usage: node scripts/solana/import-keypair.cjs <path-to-id.json>');
      process.exit(1);
    }

    const absSrc = path.resolve(src);
    const buf = fs.readFileSync(absSrc);
    const arr = JSON.parse(buf.toString());
    if (!Array.isArray(arr) || arr.length < 32) {
      throw new Error('Invalid keypair JSON: expected array of numbers');
    }

    const dir = getSolanaConfigDir();
    fs.mkdirSync(dir, { recursive: true });
    const dest = path.join(dir, 'id.json');
    fs.writeFileSync(dest, JSON.stringify(arr));
    console.log('✅ Imported keypair to', dest);
    console.log('Tip: set SOLANA_KEYPAIR="' + dest + '" to use explicitly.');
  } catch (err) {
    console.error('❌ Failed to import keypair:', err?.message || err);
    process.exit(1);
  }
})();
