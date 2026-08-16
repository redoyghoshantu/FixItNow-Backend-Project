import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding started...");

  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@fixitnow.com" },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        name: "Super Admin",
        email: "admin@fixitnow.com",
        password: hashedPassword,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });
    console.log("Admin created: admin@fixitnow.com / admin123");
  } else {
    console.log("ℹAdmin already exists, skipping");
  }

  
  const categories = [
    { name: "Plumbing", description: "Pipe and water related services" },
    { name: "Electrical", description: "Wiring and electrical repairs" },
    { name: "Cleaning", description: "Home and office cleaning services" },
    { name: "Painting", description: "Interior and exterior painting" },
  ];

  for (const category of categories) {
    const existing = await prisma.category.findUnique({
      where: { name: category.name },
    });
    if (!existing) {
      await prisma.category.create({ data: category });
      console.log(`Category created: ${category.name}`);
    } else {
      console.log(`ℹ Category "${category.name}" already exists, skipping`);
    }
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(" Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });