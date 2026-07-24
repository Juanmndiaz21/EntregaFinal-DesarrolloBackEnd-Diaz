const Cart = require("../models/Cart");
const Product = require("../models/Product");

class CartManager {
  async getCarts() {
    return Cart.find().lean();
  }

  async getCartById(id) {
    return Cart.findById(id).populate("products.product").lean();
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

    const productIndex = cart.products.findIndex((item) => item.product.toString() === pid.toString());

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

    cart.products = cart.products.filter((item) => item.product.toString() !== pid.toString());
    await cart.save();

    return Cart.findById(cid).populate("products.product").lean();
  }

  async updateCartProducts(cid, products) {
    const cart = await Cart.findById(cid);
    if (!cart) return null;

    cart.products = Array.isArray(products)
      ? products.map((item) => ({
          product: item.product,
          quantity: item.quantity,
        }))
      : [];

    await cart.save();
    return Cart.findById(cid).populate("products.product").lean();
  }

  async updateProductQuantity(cid, pid, quantity) {
    const cart = await Cart.findById(cid);
    if (!cart) return null;

    const productIndex = cart.products.findIndex((item) => item.product.toString() === pid.toString());

    if (productIndex === -1) return null;

    cart.products[productIndex].quantity = quantity;
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