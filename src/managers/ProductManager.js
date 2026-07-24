const Product = require("../models/Product");

class ProductManager {
  async getProducts() {
    return Product.find().lean();
  }

  async getProductsPaginated(page = 1, limit = 10, query = "", sort = "") {
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const currentLimit = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (currentPage - 1) * currentLimit;

    const filter = {};
    const sortOptions = {};

    if (query !== undefined && query !== null && String(query).trim() !== "") {
      const normalizedQuery = String(query).trim();

      if (normalizedQuery === "true" || normalizedQuery === "false") {
        filter.status = normalizedQuery === "true";
      } else {
        filter.category = normalizedQuery;
      }
    }

    if (sort === "asc") {
      sortOptions.price = 1;
    }

    if (sort === "desc") {
      sortOptions.price = -1;
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
    return Product.findByIdAndDelete(id).lean();
  }
}

module.exports = ProductManager;