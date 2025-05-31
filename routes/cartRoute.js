const express = require("express");
const router = express.Router();
const cartController = require("../controller/cartController");

router.post("/add", cartController.addToCart);
router.post("/cancel", cartController.cancelCartItem);
router.get("/:customerId", cartController.getCart);

module.exports = router;

// In your main app.js or server.js

