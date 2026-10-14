require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../db');

(async () => {
  const email = process.env.ADMIN_EMAIL;
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES ($1, $2, $3, $4, 'admin') ON CONFLICT (email) DO NOTHING`,
    ['System Administrator Account', email, hash, 'Head Office']
  );
  console.log(`Admin ready: ${email}`);
  await pool.end();
})().catch((e) => { console.error(e); process.exit(1); });
