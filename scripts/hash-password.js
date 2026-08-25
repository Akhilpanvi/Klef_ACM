import bcrypt from 'bcryptjs';

const password = process.argv[2];
if (!password) {
  console.error('Error: Please provide a password to hash.');
  console.log('Usage: node scripts/hash-password.js <your_password>');
  process.exit(1);
}

// bcrypt with high-security cost factor (12 rounds)
const salt = bcrypt.genSaltSync(12);
const hash = bcrypt.hashSync(password, salt);

console.log('\n======================================================');
console.log('           PASSWORD HASHING TOOL');
console.log('======================================================');
console.log(`Plaintext Password:  ${password}`);
console.log(`Generated Hash:      ${hash}`);
console.log('======================================================');
console.log('Copy the Generated Hash above and insert it into your');
console.log('admin_users database table row.');
console.log('======================================================\n');
