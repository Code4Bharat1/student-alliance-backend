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
    const orders = await Order.find({ customer: req.params.customerId })
      .populate("items.product"); // <-- This line populates product details
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

// Cancel an order
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    // Find the order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    // Optionally check if the order can be cancelled (e.g., not delivered)
    if (order.orderStatus === "Delivered") {
      return res.status(400).json({ message: "Delivered orders cannot be cancelled." });
    }

    order.orderStatus = "Cancelled";
    const updatedOrder = await order.save();
    res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
      order: updatedOrder,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderCountsByCustomer = async (req, res) => {
  try {
    const counts = await Order.aggregate([
      { $group: { _id: "$customer", totalOrders: { $sum: 1 } } }
    ]);
    res.json(counts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getLastOrderDatesByCustomer = async (req, res) => {
  try {
    const lastOrders = await Order.aggregate([
      {
        $group: {
          _id: "$customer",
          lastOrder: { $max: "$updatedAt" }
        }
      }
    ]);
    res.json(lastOrders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};