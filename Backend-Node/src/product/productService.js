const prisma = require("../db");
const {
  findProductById,
  getAllProductss,
  CreateProducts,
  DeleteProductFromId,
  UpdatedProduct,
} = require("./productRepository");

const getAllProducts = async () => {
  const product = getAllProductss();

  return product;
};

const getProductById = async (id) => {
  if (typeof id !== "number") {
    throw Error("id must a number");
  }
  // const productId = req.params.id

  const product = findProductById(id);

  if (!product) {
    throw Error("product not found");
  }

  return product;
};

const CreateProduct = async (newProduct) => {
  const { name, price, description, image } = newProduct;
  const product = await prisma.product.create({
    data: {
      name,
      price: parseInt(price),
      description,
      image, // Menyimpan path gambar yang sudah di-upload
    },
  });
  return product;
};

const DeleteProductById = async (id) => {
  await getAllProducts(id);

  await DeleteProductFromId(parseInt(id));
};

const EditedProductById = async (id, ProdukData) => {
  await getProductById(id);
  const produk = await UpdatedProduct(id, ProdukData);

  return produk;
};

module.exports = {
  getAllProducts,
  getProductById,
  CreateProduct,
  DeleteProductById,
  EditedProductById,
};
