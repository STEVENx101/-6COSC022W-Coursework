const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

const {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword
} = require("../controllers/authController");

const validate = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimiter");



/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and password management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 */


router.post(
  "/register",
  authLimiter,
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
  ],
  validate,
  registerUser
);



/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a verified user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 *       403:
 *         description: Email not verified
 */

router.post(
  "/login",
  authLimiter,
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required")
  ],
  validate,
  loginUser
);


/**
 * @swagger
 * /api/auth/verify/{token}:
 *   get:
 *     summary: Verify user email
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */


router.get("/verify/:token", verifyEmail);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Generate password reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset link sent
 *       404:
 *         description: User not found
 */

router.post(
  "/forgot-password",
  authLimiter,
  [
    body("email").isEmail().withMessage("Valid email is required")
  ],
  validate,
  forgotPassword
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid token or validation error
 */

router.post(
  "/reset-password",
  authLimiter,
  [
    body("token").notEmpty().withMessage("Token is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters")
  ],
  validate,
  resetPassword
);


module.exports = router;