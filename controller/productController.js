const Product = require("../models/Product");
const cloudinary = require("../utils/cloudinary.js");


const createProduct = async (req, res) => {
    try {
        const {
            name,
            price,
            description,
            image,
            imagePublicId,
            category,
            rating,
            quantity,
            discount,
            stocks,
            features,
            additionalImages
        } = req.body;


        const product = new Product({
            name,
            price,
            description,
            image,
            imagePublicId,
            category,
            rating,
            quantity,
            discount,
            stocks,
            features,
            additionalImages
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

const getProductsById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if(typeof req.params.id !== 'string' || req.params.id.length !== 24) {
            console.log('Invalid product ID format:', req.params.id);
        }

        if (!product) {
            console.log('Product not found for ID:', req.params.id);
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.log('Error occurred:', error.message);

        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid product ID format' });
        }

        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

const updateProduct = async (req, res) => {
    try {
        const {
            name,
            price,
            description,
            image,
            imagePublicId,
            category,
            rating,
            quantity,
            discount,
            stocks,
            features,
            additionalImages
        } = req.body;

        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        if (name !== undefined) product.name = name;
        if (price !== undefined) product.price = price;
        if (description !== undefined) product.description = description;
        if (image !== undefined) product.image = image;
        if (imagePublicId !== undefined) product.imagePublicId = imagePublicId;
        if (category !== undefined) product.category = category;
        if (rating !== undefined) product.rating = rating;
        if (quantity !== undefined) product.quantity = quantity;
        if (discount !== undefined) product.discount = discount;
        if (stocks !== undefined) product.stocks = stocks;
        if (features !== undefined) product.features = features;
        if (additionalImages !== undefined) product.additionalImages = additionalImages;

        await product.save();

        res.json(product);
    } catch (err) {
        console.error("Update error:", err.message);
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
    getProductsById,
    updateProduct,
    deleteProduct,
};
