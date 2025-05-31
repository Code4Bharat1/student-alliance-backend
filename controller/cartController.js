const Cart = require("../models/cartModel");
const Product = require("../models/Product");

// Add product to cart
exports.addToCart = async (req, res) => {
  try {
    const { customerId, productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product || product.stocks < quantity) {
      return res.status(400).json({ message: "Product not available or insufficient stock" });
    }

    product.stocks -= quantity;
    product.quantity += quantity;
    await product.save();

    let cart = await Cart.findOne({ customer: customerId });
    if (!cart) {
      cart = await Cart.create({ customer: customerId, items: [] });
    }

    const itemIndex = cart.items.findIndex((item) => item.product.equals(productId));
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    await cart.save();

    res.status(200).json({ message: "Product added to cart", cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cancel product from cart (remove item and restore stock)
exports.cancelCartItem = async (req, res) => {
  try {
    const { customerId, productId } = req.body;
    const cart = await Cart.findOne({ customer: customerId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex((item) => item.product.equals(productId));
    if (itemIndex === -1) return res.status(404).json({ message: "Product not in cart" });

    const quantity = cart.items[itemIndex].quantity;

    // Restore product stock and decrease quantity sold
    const product = await Product.findById(productId);
    if (product) {
      product.stocks += quantity;
      product.quantity -= quantity;
      await product.save();
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    res.status(200).json({ message: "Product removed from cart", cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get cart for a customer
exports.getCart = async (req, res) => {
  try {
    const { customerId } = req.params;
    const cart = await Cart.findOne({ customer: customerId }).populate("items.product");
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};