const express = require("express");
const router = express.Router();
const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");

/**
 * @swagger
 * tags:
 *   name: Dev
 *   description: Developer test endpoints
 */

/**
 * @swagger
 * /api/dev/test-key:
 *   get:
 *     summary: Test API key authentication
 *     tags: [Dev]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: API key works
 *       401:
 *         description: Invalid or missing API key
 */
router.get("/test-key", apiKeyMiddleware, (req, res) => {
  res.json({
    message: "API key works",
    keyId: req.apiKey.id,
    usageCount: req.apiKey.usage_count
  });
});

module.exports = router;