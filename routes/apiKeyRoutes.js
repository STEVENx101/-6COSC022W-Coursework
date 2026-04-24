const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const {
  generateApiKey,
  getMyApiKeys,
  revokeApiKey,
  getApiKeyStats,
  getApiKeyLogs,
  getValidPermissions
} = require("../controllers/apiKeyController");

/**
 * @swagger
 * tags:
 *   name: API Keys
 *   description: API key management with scoped permissions
 */

/**
 * @swagger
 * /api/keys/permissions:
 *   get:
 *     summary: Get valid permission scopes
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of valid permissions
 */
router.get("/permissions", authMiddleware, getValidPermissions);

/**
 * @swagger
 * /api/keys/generate:
 *   post:
 *     summary: Generate a new API key with scoped permissions
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               client_name:
 *                 type: string
 *                 example: "Analytics Dashboard"
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["read:alumni", "read:analytics"]
 *     responses:
 *       201:
 *         description: API key generated successfully
 *       400:
 *         description: Invalid permissions
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/generate",
  authMiddleware,
  [
    body("client_name").optional().trim().escape().isLength({ max: 100 }),
    body("permissions").optional().isArray()
  ],
  validate,
  generateApiKey
);

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
 *     summary: Get API key statistics
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

/**
 * @swagger
 * /api/keys/{id}/logs:
 *   get:
 *     summary: Get API key usage logs (endpoints accessed, timestamps, IPs)
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page (default 50)
 *     responses:
 *       200:
 *         description: Usage logs fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: API key not found
 */
router.get("/:id/logs", authMiddleware, getApiKeyLogs);

module.exports = router;