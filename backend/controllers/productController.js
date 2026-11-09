const Product = require("../models/Product");

// Get all products with search, filtering, sorting and pagination
const getProducts = async (req, res, next) => {
  try {
    const { search, category, sort, page = 1, limit = 12 } = req.query;

    const filter = {};

    if (search) {
      filter.title = {
        $regex: search,
        $options: "i",
      };
    }

    if (category) {
      filter.category = category;
    }

    let sortOption = {};

    if (sort === "price-asc") {
      sortOption.price = 1;
    } else if (sort === "price-desc") {
      sortOption.price = -1;
    } else if (sort === "rating") {
      sortOption.rating = -1;
    } else {
      sortOption.createdAt = -1;
    }

    const currentPage = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 12, 1), 100);
    const skip = (currentPage - 1) * pageSize;

    const [products, totalProducts] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(pageSize),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      totalProducts,
      currentPage,
      totalPages: Math.ceil(totalProducts / pageSize),
      products,
    });
  } catch (error) {
    next(error);
  }
};

// Get one product by its MongoDB ID
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    next(error);
  }
};

// Get all available product categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct("category");

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  getCategories,
};
