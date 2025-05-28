const Product = require("../models/Product");
const cloudinary = require("../utils/cloudinary.js");


const createProduct = async (req, res) => {
    try {
        const { name, price, description, image, imagePublicId } = req.body;

        if (!name || !price || !image || !imagePublicId) {
            return res.status(400).json({ message: "Name, price, and image are required" });
        }

        const product = new Product({
            name,
            price,
            description,
            image,
            imagePublicId,
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
        if (!product) return res.status(404).json({ error: "Product not found" });

        const imageUrl = product.image;

        if (imageUrl && imageUrl.startsWith("https")) {
            try {
                const url = new URL(imageUrl);
                const segments = url.pathname.split('/');
                const fileName = segments.pop();
                const folder = segments.slice(segments.indexOf("upload") + 1).join('/');
                const publicId = `${folder}/${fileName.split('.')[0]}`;

                console.log("Deleting image from Cloudinary with public ID:", publicId);
                await cloudinary.uploader.destroy(publicId);
            } catch (cloudErr) {
                console.warn("Cloudinary image delete failed:", cloudErr.message);
            }
        } else {
            console.warn("No valid image URL to delete.");
        }

        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: error.message || "Server error" });
    }
};


module.exports = {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct,
};
