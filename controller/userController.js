const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const createToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log("Signup request body:", req.body);

        // Input validation
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required",
                error: "MISSING_FIELDS"
            });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address",
                error: "INVALID_EMAIL"
            });
        }

        // Password length validation
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long",
                error: "PASSWORD_TOO_SHORT"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(409).json({
                message: "An account with this email already exists",
                error: "USER_EXISTS"
            });
        }

        // Create new user
        const newUser = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password
        });

        const token = createToken(newUser);

        console.log("User created successfully:", newUser.email);

        res.status(201).json({
            message: "Account created successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            },
            token,
        });
    } catch (err) {
        console.error("Signup error:", err);

        // Handle MongoDB duplicate key error
        if (err.code === 11000) {
            return res.status(409).json({
                message: "An account with this email already exists",
                error: "DUPLICATE_EMAIL"
            });
        }

        // Handle validation errors
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({
                message: errors.join('. '),
                error: "VALIDATION_ERROR"
            });
        }

        res.status(500).json({
            message: "Internal server error. Please try again later.",
            error: "SERVER_ERROR"
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Login request for email:", email);

        // Input validation
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
                error: "MISSING_CREDENTIALS"
            });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
                error: "INVALID_CREDENTIALS"
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
                error: "INVALID_CREDENTIALS"
            });
        }

        const token = createToken(user);

        console.log("Login successful for user:", user.email);

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            token,
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({
            message: "Internal server error. Please try again later.",
            error: "SERVER_ERROR"
        });
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                error: "USER_NOT_FOUND"
            });
        }
        res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error("Get current user error:", err);
        res.status(500).json({
            message: "Internal server error. Please try again later.",
            error: "SERVER_ERROR"
        });
    }
};