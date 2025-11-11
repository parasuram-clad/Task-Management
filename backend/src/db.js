const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.PGSSLMODE === 'require'
      ? { rejectUnauthorized: false }
      : false,
});

pool.on('error', (err) => {
  console.error('Unexpected PG client error', err);
  process.exit(1);
});

async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV !== 'production') {
    console.log('PG query', { text, duration, rows: res.rowCount });
  }
  return res;
}

module.exports = {
  query,
  pool,
};
