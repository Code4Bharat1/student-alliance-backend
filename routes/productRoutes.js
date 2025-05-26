const express = require('express');
const router = express.Router();
const { addProduct, getProducts } = require('../controller/productController');
const upload = require('../middleware/uploadMiddleware');

router.post('/upload', upload.single('image'), addProduct); // Route for uploading a product
router.get('/', getProducts); // Route for fetching all products

module.exports = router;
