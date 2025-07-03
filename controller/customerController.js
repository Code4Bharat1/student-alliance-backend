const Customer = require("../models/customerModel");
const { uploadFileToWasabi } = require("../utils/wasabi.js");
const bcrypt = require("bcryptjs");

exports.createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

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
    const email = req.params.email;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const customer = await Customer.findOne({ email });
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const update = {};

    // Handle text fields
    if (req.body.name) update.name = req.body.name;
    if (req.body.email) update.email = req.body.email;
    if (req.body.phone) update.phone = req.body.phone;
    if (req.body.address) update.address = req.body.address;

    // Handle password
    if (req.body.password) {
      update.password = await bcrypt.hash(req.body.password, 10);
    }

    if (req.file) {
      // Upload to Wasabi instead of Cloudinary
      const result = await uploadFileToWasabi({
        buffer: req.file.buffer,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        folder: 'student-alliance/uploads',
      });
      update.profilePhoto = result.fileUrl;
    }

    const customer = await Customer.findByIdAndUpdate(id, update, { new: true });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json({ message: "Profile updated", customer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.status(200).json({ message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    // Find customer by email
    const customer = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Login successful
    res.status(200).json({
      success: true,
      message: "Login successful",
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        profilePhoto: customer.profilePhoto
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: err.message
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and new password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const user = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.password = password;
    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ message: "Server error." });
  }
};


exports.updateCustomerPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password and save
    customer.password = hashedPassword;
    const updatedCustomer = await customer.save();

    if (!updatedCustomer) {
      return res.status(400).json({ message: "Failed to update password" });
    }

    res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({
      success: false,
      message: "Error updating password",
      error: err.message,
    });
  }
};

exports.getCustomersPerMonth = async (req, res) => {
  try {
    const data = await Customer.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    // Map month numbers to names
    const monthNames = [
      "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const result = Array.from({ length: 12 }, (_, i) => ({
      name: monthNames[i + 1],
      customers: 0
    }));
    data.forEach(item => {
      result[item._id - 1].customers = item.count;
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
