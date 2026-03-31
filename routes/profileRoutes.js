const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const {
  createProfile,
  getMyProfile,
  updateMyProfile
} = require("../controllers/profileController");

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile operations
 */

const profileValidation = [
  body("full_name")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Full name must be less than 255 characters"),
  body("bio")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("Bio must be less than 2000 characters"),
  body("profile_image")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Profile image must be less than 255 characters")
];

/**
 * @swagger
 * /api/profile:
 *   post:
 *     summary: Create profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileRequest'
 *     responses:
 *       201:
 *         description: Profile created successfully
 *       401:
 *         description: Unauthorized
 */

router.post("/", authMiddleware, profileValidation, validate, createProfile);

/**
 * @swagger
 * /api/profile/me:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 */


router.get("/me", authMiddleware, getMyProfile);

/**
 * @swagger
 * /api/profile/me:
 *   put:
 *     summary: Update current user's profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */


router.put("/me", authMiddleware, profileValidation, validate, updateMyProfile);


module.exports = router;