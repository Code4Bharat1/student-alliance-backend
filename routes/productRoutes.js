const express = require("express");
const {
    createProduct,
    getProducts,
    getProductsById,
    updateProduct,
    deleteProduct,
} = require("../controller/productController");

const router = express.Router();

router.post("/", createProduct);
router.get("/", getProducts);
router.get("/:id", getProductsById);
router.put("/:id", updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
