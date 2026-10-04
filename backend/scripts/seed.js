require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../src/config/db');

(async () => {
  const hash = await bcrypt.hash('Test@1234', 10);

  const upsertUser = async (name, email, address, role) => {
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, address, role)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
       RETURNING id`, [name, email, hash, address, role]);
    return rows[0].id;
  };

  await upsertUser('System Administrator Account', 'admin@example.com', 'Head Office, Bhopal', 'ADMIN');
  const ownerId = await upsertUser('Rakesh Kumar Store Owner One', 'owner@example.com', 'Bhopal, MP', 'OWNER');
  const user1 = await upsertUser('Normal User Number One Test', 'user1@example.com', 'MP Nagar, Bhopal', 'USER');
  const user2 = await upsertUser('Normal User Number Two Test', 'user2@example.com', 'Arera Colony, Bhopal', 'USER');

  const stores = await pool.query(
    `INSERT INTO stores (name, email, address, owner_id)
     VALUES ('Sharma General Store and Supplies', 'sharma@store.com', 'New Market, Bhopal', $1),
            ('Green Valley Organic Food Market', 'greenvalley@store.com', 'Hoshangabad Road, Bhopal', NULL)
     ON CONFLICT (email) DO NOTHING
     RETURNING id`, [ownerId]);

  if (stores.rows[0]) {
    await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating) VALUES ($1,$2,5), ($3,$2,4)
       ON CONFLICT DO NOTHING`, [user1, stores.rows[0].id, user2]);
  }

  console.log('Seed complete. Demo password for all: Test@1234');
  await pool.end();
})();