const express = require("express");
const router = express.Router();
const orderController = require("../controller/orderController");

// Create order
router.post("/", orderController.createOrder);

// Get all orders (admin)
router.get("/", orderController.getAllOrders);

// Get orders for a customer
router.get("/customer/:customerId", orderController.getOrdersByCustomer);

// Get single order by ID
router.get("/:id", orderController.getOrderById);

module.exports = router;