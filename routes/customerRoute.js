const express = require("express");
const router = express.Router();
const customerController = require("../controller/customerController");

// Create
router.post("/", customerController.createCustomer);

// Read all
router.get("/", customerController.getCustomers);

// Read one
router.get("/:id", customerController.getCustomerById);

// Update
router.put("/:id", customerController.updateCustomer);

// Delete
router.delete("/:id", customerController.deleteCustomer);

// Login
router.post("/login", customerController.loginCustomer);

module.exports = router;