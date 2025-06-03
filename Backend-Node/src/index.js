const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const ProductController = require("./product/productController");
const cors = require("cors");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const LoginController = require("./auth/LoginController");
const OrderController = require("./order/OrderController");
const UserController = require("./user/UserController");
const LogoutController = require("./auth/LogoutController");
app.use(cors());

dotenv.config();

const PORT = process.env.PORT || 3001;

app.use(express.json());

const accessValidation = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({
      message: "Token Diperlukan",
    });
  }

  const token = authorization.split(" ")[1];
  const secret = process.env.JWT_SECRET;
  try {
    const jwtDecode = jwt.verify(token, secret);
    req.userData = jwtDecode;
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  next();
};

app.use("/uploads", express.static(path.join(__dirname, "product", "uploads")));
app.use("/public", express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.redirect("/api-docs");
});

const swaggerDocument = YAML.load(
  path.join(__dirname, "product", "swagger.yaml")
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/products", accessValidation, ProductController);
app.use("/login", LoginController);
app.use("/orders", accessValidation, OrderController);
app.use("/me", accessValidation, UserController);
app.use("/logout", LogoutController);

app.listen(PORT, () => {
  console.log(`Listening on Port : ${PORT}`);
});
