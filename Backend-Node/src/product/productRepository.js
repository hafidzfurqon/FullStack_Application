const prisma = require("../db");

const BASE_URLS =
  process.env.BASE_URL || `http://localhost:${process.env.PORT}/uploads`;

const BASE_URL = BASE_URLS; // ganti sesuai domain produksi jika perlu

const getAllProductss = async ({
  page = 1,
  limit = 5,
  search = "",
  sort = "latest",
}) => {
  const skip = (page - 1) * limit;
  const orderBy = sort === "oldest" ? "asc" : "desc";

  // Pastikan search adalah string
  const where = search
    ? {
        name: {
          contains: String(search), // pastikan search menjadi string
          mode: "insensitive",
        },
      }
    : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { id: orderBy },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const productsWithImageUrl = products.map((p) => ({
    ...p,
    image: `${BASE_URL}/${p.image}`,
  }));

  return { data: productsWithImageUrl, total, page, limit };
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

const UpdatedProduct = async (id, ProductData) => {
  const product = await prisma.product.update({
    where: {
      id: parseInt(id),
    },

    data: {
      name: ProductData.name,
      price: ProductData.price,
      description: ProductData.description,
      image: ProductData.image,
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
