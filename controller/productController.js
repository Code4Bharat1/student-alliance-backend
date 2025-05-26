const Product = require('../models/Product');

// Add a new product
exports.addProduct = async (req, res) => {
    try {
        const { name, description, price } = req.body;
        const image = req.file ? req.file.path : null;

        const product = new Product({ name, description, price, image });
        await product.save();

        res.status(201).json({ message: 'Product added successfully!', product });
    } catch (error) {
        res.status(500).json({ message: 'Error adding product', error });
    }
};

// Get all products
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
};
