const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getInfluencerOfTheDay,
  activateWinningProfile,
  updateAppearanceCount,
  resetAppearanceCount
} = require("../controllers/influencerController");

/**
 * @swagger
 * tags:
 *   name: Influencer
 *   description: Influencer of the day management
 */

/**
 * @swagger
 * /api/influencer/today:
 *   get:
 *     summary: Get alumni influencer of the day
 *     tags: [Influencer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Influencer of the day fetched successfully
 *       404:
 *         description: No influencer assigned for today
 */
router.get("/today", authMiddleware, getInfluencerOfTheDay);

/**
 * @swagger
 * /api/influencer/activate/{userId}:
 *   post:
 *     summary: Activate winning alumni profile for today
 *     tags: [Influencer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Winning alumni profile activated successfully
 *       200:
 *         description: Winning alumni profile updated for today
 */
router.post("/activate/:userId", authMiddleware, activateWinningProfile);

/**
 * @swagger
 * /api/influencer/update-appearance/{userId}:
 *   put:
 *     summary: Update appearance count
 *     tags: [Influencer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Appearance count updated successfully
 */
router.put("/update-appearance/:userId", authMiddleware, updateAppearanceCount);

/**
 * @swagger
 * /api/influencer/reset-appearance/{userId}:
 *   put:
 *     summary: Reset appearance count
 *     tags: [Influencer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Appearance count reset successfully
 */
router.put("/reset-appearance/:userId", authMiddleware, resetAppearanceCount);

module.exports = router;