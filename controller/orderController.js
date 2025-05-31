const Order = require("../models/orderModel");

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const {
      customerDetails,
      orderDetails: { items, subtotal, shippingFee, discount, total, orderDate },
      paymentStatus,
    } = req.body;

    const order = await Order.create({
      customer: req.body.customerId || (customerDetails && customerDetails.customerId),
      items: items.map((item) => ({
        product: item.product._id || item.product,
        quantity: item.quantity,
      })),
      subtotal,
      shippingFee,
      discount,
      total,
      paymentStatus: paymentStatus || "pending",
      orderDate: orderDate || Date.now(),
      customerDetails,
    });

    res.status(201).json({ success: true, orderId: order._id, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("customer").populate("items.product");
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get orders for a specific customer
exports.getOrdersByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const orders = await Order.find({ customer: customerId }).populate("items.product");
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("customer").populate("items.product");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};