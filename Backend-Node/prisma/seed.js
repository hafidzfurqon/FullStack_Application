const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
require("dotenv").config();

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.users.findUnique({
    where: { email: "admin@gmail.com" },
  });

  if (!existingAdmin) {
    const adminPassword = await bcrypt.hash("admin123456", 10);
    await prisma.users.create({
      data: {
        name: "Admin",
        email: "admin@gmail.com",
        password: adminPassword,
        role: "Admin",
        address: "Jl. Admin",
      },
    });
    console.log("Admin created.");
  } else {
    console.log("Admin already exists.");
  }

  const existingUser = await prisma.users.findUnique({
    where: { email: "user@gmail.com" },
  });

  if (!existingUser) {
    const userPassword = await bcrypt.hash("user123456", 10);
    await prisma.users.create({
      data: {
        name: "User",
        email: "user@gmail.com",
        password: userPassword,
        role: "User",
        address: "Jl. User",
      },
    });
    console.log("User created.");
  } else {
    console.log("User already exists.");
  }

  const existingProduct = await prisma.product.findFirst({
    where: { name: "Mechanical Keyboard" },
  });

  if (!existingProduct) {
    await prisma.product.create({
      data: {
        name: "Mechanical Keyboard",
        price: 15000,
        description: "This is an example keyboard product",
        image: "/1745986620397-images.jpeg",
      },
    });
    console.log("Product created.");
  } else {
    console.log("Product already exists.");
  }

  console.log("Seeder selesai dijalankan.");
}

main()
  .catch((e) => {
    console.error("Seeder error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });