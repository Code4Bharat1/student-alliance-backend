const express = require("express");
const router = express.Router();
const { login, signup, getCurrentUser, checkEmail, sendOtp, verifyOtp } = require("../controller/userController");
const authMiddleware = require("../middleware/userMiddleware")

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", authMiddleware, getCurrentUser);
router.post("/check-email", checkEmail);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

module.exports = router;
