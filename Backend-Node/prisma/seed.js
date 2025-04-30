const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.product.create({
    data: {
      name: "Mechanical Keyboard",
      price: 15000,
      description: "This is an example keyboard product",
      image: "/public/1745986620397-images.jpeg"
    },
  });
}

main()
  .then(() => {
    console.log("Seeder berhasil dijalankan");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
