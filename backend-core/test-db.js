import pg from 'pg';
import 'dotenv/config';

const { Client } = pg;
const connectionString = process.env.DATABASE_URL;

console.log('Testing connection to:', connectionString.replace(/:([^:@]+)@/, ':****@'));

const isLocal = connectionString && (connectionString.includes("localhost") || connectionString.includes("127.0.0.1"));
const client = new Client({
  connectionString,
  ssl: isLocal ? false : {
    rejectUnauthorized: false,
  },
});

async function main() {
  try {
    await client.connect();
    console.log('Successfully connected!');
    const res = await client.query('SELECT NOW()');
    console.log('Time:', res.rows[0]);
  } catch (err) {
    console.error('Error details:', err);
  } finally {
    await client.end();
  }
}

main();
