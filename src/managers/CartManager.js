const Cart = require("../models/Cart");
const Product = require("../models/Product");

class CartManager {
  async getCarts() {
    return Cart.find().lean();
  }

  async getCartById(id) {
    const cart = await Cart.findById(id).populate("products.product");

    if (!cart) {
      return null;
    }

    const cleanedProducts = cart.products.filter((item) => item.product);

    if (cleanedProducts.length !== cart.products.length) {
      cart.products = cleanedProducts;
      await cart.save();
    }

    return cart.toObject();
  }

  async createCart() {
    const newCart = await Cart.create({ products: [] });
    return newCart.toObject();
  }

  async addProductToCart(cid, pid) {
    const cart = await Cart.findById(cid);
    if (!cart) return null;

    const product = await Product.findById(pid);
    if (!product) return null;

    const productIndex = cart.products.findIndex((item) => item.product && item.product.toString() === pid.toString());

    if (productIndex !== -1) {
      cart.products[productIndex].quantity += 1;
    } else {
      cart.products.push({ product: product._id, quantity: 1 });
    }

    await cart.save();
    return Cart.findById(cid).populate("products.product").lean();
  }

  async deleteProductFromCart(cid, pid) {
    const cart = await Cart.findById(cid);
    if (!cart) return null;

    cart.products = cart.products.filter((item) => item.product && item.product.toString() !== pid.toString());
    await cart.save();

    return Cart.findById(cid).populate("products.product").lean();
  }

  async updateCartProducts(cid, products) {
    const cart = await Cart.findById(cid);
    if (!cart) return null;

    const normalizedProducts = new Map();

    if (Array.isArray(products)) {
      products.forEach((item) => {
        const productId = item?.product?.toString?.() ?? String(item?.product ?? "").trim();
        const quantity = Number.parseInt(item?.quantity, 10);

        if (!productId || !Number.isInteger(quantity) || quantity < 1) {
          return;
        }

        normalizedProducts.set(productId, {
          product: productId,
          quantity,
        });
      });
    }

    cart.products = Array.from(normalizedProducts.values());

    await cart.save();
    return Cart.findById(cid).populate("products.product").lean();
  }

  async updateProductQuantity(cid, pid, quantity) {
    const cart = await Cart.findById(cid);
    if (!cart) return null;

    const nextQuantity = Number.parseInt(quantity, 10);

    if (!Number.isInteger(nextQuantity) || nextQuantity < 1) {
      return null;
    }

    const productIndex = cart.products.findIndex((item) => item.product && item.product.toString() === pid.toString());

    if (productIndex === -1) return null;

    cart.products[productIndex].quantity = nextQuantity;
    await cart.save();

    return Cart.findById(cid).populate("products.product").lean();
  }

  async clearCart(cid) {
    const cart = await Cart.findById(cid);
    if (!cart) return null;

    cart.products = [];
    await cart.save();

    return Cart.findById(cid).populate("products.product").lean();
  }
}

module.exports = CartManager;