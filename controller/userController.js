const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const OtpModel = require("../models/Otp");

const otpStore = {};

const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

setInterval(() => {
    const now = Date.now();
    Object.keys(otpStore).forEach(email => {
        if (otpStore[email].expires < now) {
            delete otpStore[email];
        }
    });
}, 60 * 60 * 1000);

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


        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address",
                error: "INVALID_EMAIL"
            });
        }


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

exports.checkEmail = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        console.log("Checking email:", email);

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(404).json({ message: "Email not found" });
        }
        // Here you can generate/send OTP if needed
        res.status(200).json({ message: "Email exists" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const sanitizedEmail = email.toLowerCase().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sanitizedEmail)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Generate a 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to database with expiry
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry
        await OtpModel.findOneAndUpdate(
            { email: sanitizedEmail },
            { otp: otpCode, expiresAt },
            { upsert: true, new: true }
        );

        // Configure nodemailer
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        const mailOptions = {
            from: `"Student Alliance" <${process.env.SMTP_EMAIL}>`,
            to: sanitizedEmail,
            subject: "Your OTP Code",
            html: `<p>Your OTP code is: <b>${otpCode}</b><br/>It will expire in 10 minutes.</p>`,
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: "OTP sent successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error sending OTP", error: err.message });
    }
  };

exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    const otpRecord = await OtpModel.findOne({ email: email.toLowerCase().trim() });

    if (
        !otpRecord ||
        otpRecord.otp !== otp ||
        Date.now() > new Date(otpRecord.expiresAt).getTime()
    ) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Optionally, delete OTP after verification
    await OtpModel.deleteOne({ email: email.toLowerCase().trim() });

    res.status(200).json({ message: "OTP verified successfully" });
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

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        user.password = password;
        await user.save();

        res.status(200).json({ message: "Password updated successfully." });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};