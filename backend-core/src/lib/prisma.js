import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/index.js';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
let prisma;

if (connectionString && connectionString.startsWith('prisma+postgres://')) {
  // Use Prisma Accelerate over HTTPS (bypasses port 5432 blocks)
  prisma = new PrismaClient({ accelerateUrl: connectionString });
} else {
  // Use driver adapter for standard/local database
  const isLocal =
    connectionString &&
    (connectionString.includes('localhost') ||
      connectionString.includes('127.0.0.1'));
  const pool = new Pool({
    connectionString,
    ssl: isLocal
      ? false
      : {
          rejectUnauthorized: false,
        },
  });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
}

export { prisma };
