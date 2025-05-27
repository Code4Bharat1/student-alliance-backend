const Product = require("../models/Product");

const createProduct = async (req, res) => {
    try {
        const { name, price, description, image } = req.body;

        if (!name || !price || !image) {
            return res.status(400).json({ message: "Name, price, and image are required" });
        }

        const product = new Product({
            name,
            price,
            description,
            image,
        });

        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ message: "Error saving product", error: err.message });
    }
};

const getProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving products", error: err.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { name, price, description } = req.body;

        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        product.name = name;
        product.price = price;
        product.description = description;
        if (req.file) product.image = req.file.path;

        await product.save();
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: "Error updating product", error: err.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        await product.deleteOne();
        res.json({ message: "Product deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting product", error: err.message });
    }
};

module.exports = {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct,
};
