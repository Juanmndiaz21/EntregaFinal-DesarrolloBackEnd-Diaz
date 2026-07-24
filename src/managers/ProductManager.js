const Product = require("../models/Product");
const Cart = require("../models/Cart");

class ProductManager {
  async getProducts() {
    return Product.find().lean();
  }

  async getProductsPaginated(params = {}) {
    const {
      page = 1,
      limit = 10,
      query = "",
      category = "",
      status = "",
      sort = "",
      sortBy = "price",
    } = params;

    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const currentLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const skip = (currentPage - 1) * currentLimit;

    const filter = {};
    const sortOptions = {};

    const normalizedQuery = String(query).trim();
    const normalizedCategory = String(category).trim();
    const normalizedStatus = String(status).trim().toLowerCase();
    const normalizedSortBy = String(sortBy).trim() || "price";

    if (normalizedQuery !== "") {
      if (normalizedQuery === "true" || normalizedQuery === "false") {
        filter.status = normalizedQuery === "true";
      } else {
        filter.$or = [
          { title: { $regex: normalizedQuery, $options: "i" } },
          { description: { $regex: normalizedQuery, $options: "i" } },
          { code: { $regex: normalizedQuery, $options: "i" } },
          { category: { $regex: normalizedQuery, $options: "i" } },
        ];
      }
    }

    if (normalizedCategory !== "") {
      filter.category = { $regex: normalizedCategory, $options: "i" };
    }

    if (normalizedStatus === "true" || normalizedStatus === "false") {
      filter.status = normalizedStatus === "true";
    }

    if (sort === "asc") {
      sortOptions[normalizedSortBy] = 1;
    }

    if (sort === "desc") {
      sortOptions[normalizedSortBy] = -1;
    }

    if (Object.keys(sortOptions).length === 0) {
      sortOptions.price = 1;
    }

    const [totalProducts, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter).sort(sortOptions).skip(skip).limit(currentLimit).lean(),
    ]);

    const totalPages = totalProducts === 0 ? 0 : Math.ceil(totalProducts / currentLimit);

    return {
      products,
      totalPages,
      page: currentPage,
      hasPrevPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
      prevPage: currentPage > 1 ? currentPage - 1 : null,
      nextPage: currentPage < totalPages ? currentPage + 1 : null,
    };
  }

  async getProductById(id) {
    return Product.findById(id).lean();
  }

  async addProduct(productData) {
    const newProduct = await Product.create({
      title: productData.title,
      description: productData.description,
      code: productData.code,
      price: productData.price,
      status: productData.status !== undefined ? productData.status : true,
      stock: productData.stock,
      category: productData.category,
      thumbnails: productData.thumbnails || [],
    });

    return newProduct.toObject();
  }

  async updateProduct(id, updatedFields) {
    const { _id, id: _ignoredId, ...safeFields } = updatedFields;
    return Product.findByIdAndUpdate(id, safeFields, { new: true }).lean();
  }

  async deleteProduct(id) {
    const deletedProduct = await Product.findByIdAndDelete(id).lean();

    if (deletedProduct) {
      await Cart.updateMany(
        { "products.product": id },
        { $pull: { products: { product: id } } }
      );
    }

    return deletedProduct;
  }
}

module.exports = ProductManager;