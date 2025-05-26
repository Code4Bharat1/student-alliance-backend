require('dotenv').config(); // Ensure .env file is loaded
const express = require('express');
const connectDB = require('./lib/connectDB'); // Import the connectDB method

const app = express();

connectDB();

app.use(express.json());

app.use('/products', require('./router/productRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
