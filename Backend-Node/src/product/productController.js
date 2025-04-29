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
const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const produkId = parseInt(req.params.id);
    const produk = await getProductById(produkId);
    res.send(produk);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.get("/", async (req, res) => {
  const product = await getAllProducts();
  res.send(product);
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
    const produkId = req.params.id;

    await DeleteProductById(produkId);

    res.send("deleted Products");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const produkId = parseInt(req.params.id);
    const { name, price, description } = req.body;
    const image = req.file?.filename;

    if (!name || !price || !description) {
      return res.status(400).send("Some fields are missing.");
    }

    // jika ada file baru, pakai yang baru. Jika tidak, pakai yang lama (dari client)
    const finalImage = image || req.body.existingImage;

    const updatedProduct = await EditedProductById(produkId, {
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
    const produkId = parseInt(req.params.id);
    const ProdukData = req.body;

    const produk = await EditedProductById(produkId, ProdukData);
    res.send({
      data: produk,
      message: "edited Product",
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
