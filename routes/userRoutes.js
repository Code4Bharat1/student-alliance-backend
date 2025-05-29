const express = require("express");
const router = express.Router();
const { login, signup, getCurrentUser, checkEmail } = require("../controller/userController");
const authMiddleware = require("../middleware/userMiddleware")

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", authMiddleware, getCurrentUser);
router.post("/check-email", checkEmail);

module.exports = router;
