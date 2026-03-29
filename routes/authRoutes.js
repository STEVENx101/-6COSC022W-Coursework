const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  verifyEmail,
//  forgotPassword,
//  resetPassword
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify/:token", verifyEmail);

//router.post("/forgot-password", forgotPassword);
//router.post("/reset-password", resetPassword);

module.exports = router;