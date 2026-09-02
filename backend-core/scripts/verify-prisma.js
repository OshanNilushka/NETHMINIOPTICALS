import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/index.js";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
let prisma;

if (connectionString && connectionString.startsWith('prisma+postgres://')) {
  prisma = new PrismaClient({ accelerateUrl: connectionString });
} else {
  const isLocal = connectionString && (connectionString.includes("localhost") || connectionString.includes("127.0.0.1"));
  const pool = new Pool({
    connectionString,
    ssl: isLocal ? false : {
      rejectUnauthorized: false,
    },
  });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
}

async function verify() {
  try {
    const user = await prisma.user.findFirst();
    console.log("✅ Connected");
    if (user) {
      console.log(`Found starter user: ${user.fullName} (${user.email})`);
    } else {
      console.log("No users found in database (but connection works!).");
    }
  } catch (err) {
    console.error("Verification failed!");
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
