const Product = require("../models/Product");
const cloudinary = require("../utils/cloudinary");


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
        const products = await Product.find();

        if (!products || products.length === 0) {
            return res.status(404).json({ message: "No products found" });
        }
        if (products.length === 0) {
            return res.status(404).json({ message: "No products found" });
        }

        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Server error while fetching products." });
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
        if (!product)
            return res.status(404).json({ error: "Product not found" });

        const imageUrl = product.image;

        const publicIdMatch = imageUrl.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
        const publicId = publicIdMatch ? publicIdMatch[1] : null;

        if (publicId) {
            await cloudinary.uploader.destroy(publicId);
        }

        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Product and image deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Server error" });
    }
  };

module.exports = {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct,
};
