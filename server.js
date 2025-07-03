const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./lib/connectDB");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const customerRoutes = require("./routes/customerRoute");
const cartRoutes = require("./routes/cartRoute");
const orderRoutes = require("./routes/orderRoutes");
const uploadRoutes = require("./routes/upload.route");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/products", productRoutes);
app.use("/api/auth",userRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/cart", cartRoutes); 
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);

connectDB().then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
