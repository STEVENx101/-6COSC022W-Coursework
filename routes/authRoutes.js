const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

const {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  logoutUser
} = require("../controllers/authController");

const validate = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimiter");
const authMiddleware = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and password management
 */

// Password strength validation – requires min 8 chars, uppercase, lowercase,
// number, and special character. This meets the CW2 security requirement for
// "password strength validation (min length, complexity)."
const passwordValidator = body("password")
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters")
  .matches(/[A-Z]/)
  .withMessage("Password must contain at least one uppercase letter")
  .matches(/[a-z]/)
  .withMessage("Password must contain at least one lowercase letter")
  .matches(/[0-9]/)
  .withMessage("Password must contain at least one number")
  .matches(/[!@#$%^&*(),.?":{}|<>]/)
  .withMessage("Password must contain at least one special character");

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
    body("email")
      .isEmail().withMessage("Valid email is required")
      .normalizeEmail()
      .trim(),
    passwordValidator
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
    body("email")
      .isEmail().withMessage("Valid email is required")
      .normalizeEmail()
      .trim(),
    body("password").notEmpty().withMessage("Password is required")
  ],
  validate,
  loginUser
);

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Verify user email using verification token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyEmailRequest'
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post(
  "/verify",
  authLimiter,
  [
    body("token")
      .notEmpty().withMessage("Verification token is required")
      .trim()
      .escape()
  ],
  validate,
  verifyEmail
);

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
    body("email")
      .isEmail().withMessage("Valid email is required")
      .normalizeEmail()
      .trim()
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
    body("token")
      .notEmpty().withMessage("Token is required")
      .trim()
      .escape(),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number")
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage("Password must contain at least one special character")
  ],
  validate,
  resetPassword
);


/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/logout", authMiddleware, logoutUser);

module.exports = router;