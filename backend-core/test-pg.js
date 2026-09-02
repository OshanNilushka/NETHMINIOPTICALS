const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
console.log('Testing connection with URL:', connectionString.replace(/:([^:@]+)@/, ':****@')); // Hide password

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function main() {
  try {
    console.log('Connecting...');
    await client.connect();
    console.log('Connected successfully!');
    const res = await client.query('SELECT NOW() as current_time, version();');
    console.log('Query result:', res.rows[0]);
  } catch (err) {
    console.error('Connection/Query error:', err);
  } finally {
    await client.end();
    console.log('Connection closed.');
  }
}

main();
