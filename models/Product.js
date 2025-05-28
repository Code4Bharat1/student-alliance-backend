const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    image: String,
    imagePublicId: String,
    category: { type: String, required: true },
    rating: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    stocks: { type: Number, default: 0 },
    features: [String],
    additionalImages: [String],
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
