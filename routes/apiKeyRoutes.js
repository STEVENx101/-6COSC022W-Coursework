const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  generateApiKey,
  getMyApiKeys,
  revokeApiKey,
  getApiKeyStats
} = require("../controllers/apiKeyController");

/**
 * @swagger
 * tags:
 *   name: API Keys
 *   description: API key management
 */

/**
 * @swagger
 * /api/keys/generate:
 *   post:
 *     summary: Generate a new API key
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: API key generated successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/generate", authMiddleware, generateApiKey);

/**
 * @swagger
 * /api/keys/me:
 *   get:
 *     summary: Get my API keys
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: API keys fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/me", authMiddleware, getMyApiKeys);

/**
 * @swagger
 * /api/keys/{id}/revoke:
 *   put:
 *     summary: Revoke an API key
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: API key revoked successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: API key not found
 */
router.put("/:id/revoke", authMiddleware, revokeApiKey);

/**
 * @swagger
 * /api/keys/{id}/stats:
 *   get:
 *     summary: Get API key stats
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: API key stats fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: API key not found
 */
router.get("/:id/stats", authMiddleware, getApiKeyStats);

module.exports = router;