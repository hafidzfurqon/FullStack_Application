const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  getAllProducts,
  getProductById,
  CreateProduct,
  DeleteProductById,
  EditProduct,
  EditedProductById,
} = require("./productService");
const { handlePayment } = require("./midtransController");
const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = await getProductById(productId);
    res.send(product);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.get("/", async (req, res) => {
  const { page = 1, limit = 5, search = "", sort = "latest" } = req.query;

  try {
    const products = await getAllProducts({
      page: Number(page),
      limit: Number(limit),
      search,
      sort,
    });

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "uploads"); // Menyimpan di folder 'uploads'
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Route untuk membuat produk
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const image = req.file?.filename;

    if (!name || !price || !description || !image) {
      return res.status(400).send("Some fields are missing.");
    }

    const newProduct = await CreateProduct({ name, price, description, image });

    res.status(201).json({
      data: newProduct,
      message: "Created Product",
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const productId = req.params.id;

    await DeleteProductById(productId);

    res.send("deleted Products");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { name, price, description } = req.body;
    const image = req.file?.filename;

    if (!name || !price || !description) {
      return res.status(400).send("Some fields are missing.");
    }

    // jika ada file baru, pakai yang baru. Jika tidak, pakai yang lama (dari client)
    const finalImage = image || req.body.existingImage;

    const updatedProduct = await EditedProductById(productId, {
      name,
      price: parseInt(price),
      description,
      image: finalImage,
    });

    res.send({
      data: updatedProduct,
      message: "Updated Product",
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const productData = req.body;

    const product = await EditedProductById(productId, productData);
    res.send({
      data: product,
      message: "edited Product",
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.post("/pay", handlePayment);

module.exports = router;
