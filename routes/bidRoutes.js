const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");

const {
  createBid,
  getMyBids,
  updateBid,
  cancelBid,
  getTomorrowSlot,
  getBidHistory,
  getMyBidStatus,
  getMonthlyLimitStatus
} = require("../controllers/bidController");

/**
 * @swagger
 * tags:
 *   name: Bids
 *   description: Bid management endpoints
 */

/**
 * @swagger
 * /api/bids:
 *   post:
 *     summary: Create a new bid
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BidRequest'
 *     responses:
 *       201:
 *         description: Bid created successfully
 */
router.post(
  "/",
  authMiddleware,
  authorize(["user"]),
  [
    body("bid_amount")
      .isFloat({ gt: 0 })
      .withMessage("Bid amount must be greater than 0"),
    body("bid_date")
      .isDate()
      .withMessage("Valid bid date is required"),
    body("slot_date")
      .optional()
      .isDate()
      .withMessage("Valid slot date is required")
  ],
  validate,
  createBid
);

/**
 * @swagger
 * /api/bids/me:
 *   get:
 *     summary: Get my bids
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bids
 */
router.get("/me", authMiddleware, authorize(["user"]), getMyBids);

/**
 * @swagger
 * /api/bids/{id}:
 *   put:
 *     summary: Update a bid
 *     tags: [Bids]
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
 *         description: Bid updated successfully
 */
router.put(
  "/:id",
  authMiddleware,
  authorize(["user"]),
  [
    body("bid_amount")
      .optional()
      .isFloat({ gt: 0 })
      .withMessage("Bid amount must be greater than 0"),
    body("bid_date")
      .optional()
      .isDate()
      .withMessage("Valid bid date is required"),
    body("slot_date")
      .optional()
      .isDate()
      .withMessage("Valid slot date is required"),
    body("status")
      .optional()
      .isIn(["PENDING", "WON", "LOST"])
      .withMessage("Status must be PENDING, WON, or LOST")
  ],
  validate,
  updateBid
);

/**
 * @swagger
 * /api/bids/{id}/cancel:
 *   put:
 *     summary: Cancel a bid
 *     tags: [Bids]
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
 *         description: Bid cancelled successfully
 */
router.put("/:id/cancel", authMiddleware, authorize(["user"]), cancelBid);

/**
 * @swagger
 * /api/bids/tomorrow-slot:
 *   get:
 *     summary: View tomorrow bidding slot
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tomorrow slot fetched successfully
 */
router.get("/tomorrow-slot", authMiddleware, authorize(["user"]), getTomorrowSlot);

/**
 * @swagger
 * /api/bids/history:
 *   get:
 *     summary: Get bidding history
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bidding history fetched successfully
 */
router.get("/history", authMiddleware, authorize(["user"]), getBidHistory);

/**
 * @swagger
 * /api/bids/status/me:
 *   get:
 *     summary: Get my bid status summary
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bid status summary fetched successfully
 */
router.get("/status/me", authMiddleware, authorize(["user"]), getMyBidStatus);

/**
 * @swagger
 * /api/bids/monthly-limit:
 *   get:
 *     summary: Get monthly bid usage limit status
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly limit status fetched successfully
 */
router.get("/monthly-limit", authMiddleware, authorize(["user"]), getMonthlyLimitStatus);

module.exports = router;