const express = require("express");
const router = express.Router();
const customerController = require("../controller/customerController");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// Create
router.post("/", customerController.createCustomer);

// Read all
router.get("/", customerController.getCustomers);

// Read one by ID
router.get("/:id", customerController.getCustomerById);

// Read one by EMAIL (fix this line)
router.get("/email/:email", customerController.getCustomerByEmail);

router.put("/:id/password", customerController.updateCustomerPassword);

router.put("/:id", upload.single("profilePhoto"), customerController.updateCustomer);

router.delete("/:id", customerController.deleteCustomer);

router.post("/login", customerController.loginCustomer);

router.post("/update-password", customerController.updatePassword);

module.exports = router;