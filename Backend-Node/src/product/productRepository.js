const prisma = require("../db");

const PORT = process.env.PORT || 3001;

const BASE_URL = `http://localhost:${PORT}/uploads`; // ganti sesuai domain produksi jika perlu

const getAllProductss = async () => {
  const products = await prisma.product.findMany();
  const productsWithImageUrl = products.map((p) => ({
    ...p,
    image: `${BASE_URL}/${p.image}`,
  }));

  return productsWithImageUrl;
};

const findProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (!product) return null;

  return {
    ...product,
    image: `${BASE_URL}/${product.image}`,
  };
};

const CreateProducts = async (newProduct) => {
  const product = await prisma.product.create({
    data: {
      name: newProduct.name,
      price: newProduct.price,
      description: newProduct.description,
      image: newProduct.image,
    },
  });

  return product;
};

const DeleteProductFromId = async (id) => {
  await prisma.product.delete({
    where: {
      id: parseInt(id),
    },
  });
};

const UpdatedProduct = async (id, ProdukData) => {
  const product = await prisma.product.update({
    where: {
      id: parseInt(id),
    },

    data: {
      name: ProdukData.name,
      price: ProdukData.price,
      description: ProdukData.description,
      image: ProdukData.image,
    },
  });
  return product;
};

module.exports = {
  getAllProductss,
  findProductById,
  CreateProducts,
  DeleteProductFromId,
  UpdatedProduct,
};
