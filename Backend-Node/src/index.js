const express = require("express");
const app = express();
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const ProductController = require("./product/productController");
const cors = require("cors");
const path = require("path");

app.use(cors());

dotenv.config();

const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "product", "uploads")));

app.get("/", (req, res) => {
  res.send(
    "Welcome to RestFull API WITH Express JS That Implementing Layered Architechture With Prisma Object Relational Model (ORM)"
  );
});

app.use("/products", ProductController);

app.listen(PORT, () => {
  console.log(`Listening on Port : ${PORT}`);
});
