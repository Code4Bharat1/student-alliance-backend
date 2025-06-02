const express = require("express");
const router = express.Router();
const orderController = require("../controller/orderController");

router.post("/", orderController.createOrder);

router.get("/", orderController.getAllOrders);

router.get("/customer/:customerId", orderController.getOrdersByCustomer);

router.get("/:id", orderController.getOrderById);

router.put("/:id/cancel", orderController.cancelOrder);

router.get("/counts/by-customer", orderController.getOrderCountsByCustomer);

router.get("/last-order/by-customer", orderController.getLastOrderDatesByCustomer);

module.exports = router;