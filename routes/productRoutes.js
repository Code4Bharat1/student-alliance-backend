const express = require("express");
const {
    createProduct,
    getProducts,
    getProductsById,
    updateProduct,
    deleteProduct,
    getProductsByCatagory,
} = require("../controller/productController");

const router = express.Router();

router.post("/", createProduct);
router.get("/", getProducts);
router.get("/category/:category", getProductsByCatagory);
router.get("/:id", getProductsById);
router.put("/:id", updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
