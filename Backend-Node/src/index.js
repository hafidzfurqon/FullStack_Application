const express = require("express");
const app = express();
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const ProductController = require("./product/productController");
const cors = require("cors");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

app.use(cors());

dotenv.config();

const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "product", "uploads")));

app.get("/", (req, res) => {
  res.redirect("/api-docs");
});

const swaggerDocument = YAML.load(
  path.join(__dirname, "product", "swagger.yaml")
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/products", ProductController);

app.listen(PORT, () => {
  console.log(`Listening on Port : ${PORT}`);
});
