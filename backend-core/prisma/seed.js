import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/index.js";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
let prisma;
let pool;

if (connectionString && connectionString.startsWith('prisma+postgres://')) {
  prisma = new PrismaClient({ accelerateUrl: connectionString });
} else {
  const isLocal = connectionString && (connectionString.includes("localhost") || connectionString.includes("127.0.0.1"));
  pool = new Pool({
    connectionString,
    ssl: isLocal ? false : {
      rejectUnauthorized: false,
    },
  });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
}

async function main() {
  console.log("Seeding database...");

  // Clear existing records in correct relation order
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.prescription.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.product.deleteMany({});

  // Seed products (eyeglass frames) with real-world recommendations
  await prisma.product.createMany({
    data: [
      {
        name: "Classic Aviator",
        brand: "Ray-Ban",
        material: "Polished Gold Metal",
        price: 145.0,
        shape: "Aviator",
        gender: "UNISEX",
        stockLevel: 20,
        imageUrl: "/src/assets/ray_ban_glasses.glb",
      },
      {
        name: "Urban Tech Square",
        brand: "Oakley",
        material: "Matte Black Acetate",
        price: 120.0,
        shape: "Square",
        gender: "UNISEX",
        stockLevel: 15,
        imageUrl: "/src/assets/oakley_glasses.glb",
      },
      {
        name: "Retro Round",
        brand: "Vogue",
        material: "Classic Tortoise",
        price: 110.0,
        shape: "Round",
        gender: "UNISEX",
        stockLevel: 10,
        imageUrl: "/src/assets/metal_round_glasses.glb",
      },
      {
        name: "Geometric Hex",
        brand: "Carrera",
        material: "Rose Gold",
        price: 130.0,
        shape: "Geometric",
        gender: "UNISEX",
        stockLevel: 12,
        imageUrl: "/src/assets/cartoon_glasses.glb",
      }
    ]
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@insightopticals.com",
      password: await bcrypt.hash("password123", 10),
      fullName: "System Administrator",
      role: "ADMIN",
    },
  });

  const optician = await prisma.user.create({
    data: {
      email: "optician1@insightopticals.com",
      password: await bcrypt.hash("password123", 10),
      fullName: "Dr. John Doe",
      role: "OPTICIAN",
    },
  });

  const patient = await prisma.user.create({
    data: {
      email: "patient1@insightopticals.com",
      password: await bcrypt.hash("password123", 10),
      fullName: "Jane Smith",
      role: "PATIENT",
      phoneNumber: "0771234567",
      dob: new Date("1995-05-15"),
      gender: "FEMALE",
    },
  });

  await prisma.prescription.create({
    data: {
      patientId: patient.id,
      opticianId: optician.id,
      rawOcrResult: "OD: SPH -1.25 CYL -0.50 AXIS 180, OS: SPH -1.00",
      isValidated: true,
      odSph: -1.25,
      odCyl: -0.50,
      odAxis: 180,
      osSph: -1.00,
      pd: 63.5,
    },
  });

  console.log("Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    if (pool) await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    if (pool) await pool.end();
    process.exit(1);
  });
