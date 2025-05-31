const Customer = require("../models/customerModel");

// Create a new customer
exports.createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all customers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCustomerByEmail = async (req, res) => {
  try {
    const email = req.params.email || req.query.email;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const customer = await Customer.findOne({ email: req.params.email } || req.query.email);
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a customer
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const update = {};

    if (req.body.password) {
      // Hash the password before saving!
      const bcrypt = require("bcryptjs");
      update.password = await bcrypt.hash(req.body.password, 10);
    }

    // Add other fields if needed

    const customer = await Customer.findByIdAndUpdate(id, update, { new: true });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json({ message: "Password updated", customer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a customer
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.status(200).json({ message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login customer
exports.loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isMatch = await customer.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    // Optionally, generate a JWT token here
    res.status(200).json({ message: "Login successful", customer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};