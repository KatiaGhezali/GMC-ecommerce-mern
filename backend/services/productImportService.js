const axios = require("axios");
const Product = require("../models/Product");

const importProducts = async () => {
  try {
    const response = await axios.get(
      "https://dummyjson.com/products?limit=100",
    );

    const products = response.data.products;

    const formattedProducts = products.map((product) => ({
      externalId: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      discountPercentage: product.discountPercentage,
      rating: product.rating,
      stock: product.stock,
      brand: product.brand || "",
      category: product.category,
      thumbnail: product.thumbnail,
      images: product.images || [],
    }));

    for (const product of formattedProducts) {
      await Product.updateOne(
        { externalId: product.externalId },
        { $set: product },
        { upsert: true },
      );
    }

    console.log(`${formattedProducts.length} products imported successfully.`);
  } catch (error) {
    console.error("Product import failed:", error.message);
    throw error;
  }
};

module.exports = importProducts;
