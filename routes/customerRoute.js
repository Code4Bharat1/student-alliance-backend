const express = require("express");
const router = express.Router();
const customerController = require("../controller/customerController");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// Create
router.post("/", customerController.createCustomer);
router.get("/", customerController.getCustomers);
router.get("/:id", customerController.getCustomerById);
router.get("/email/:email", customerController.getCustomerByEmail);
router.put("/:id/password", customerController.updateCustomerPassword);
router.put("/:id", upload.single("profilePhoto"), customerController.updateCustomer);
router.delete("/:id", customerController.deleteCustomer);
router.post("/login", customerController.loginCustomer);
router.post("/update-password", customerController.updatePassword);

module.exports = router;