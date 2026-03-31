const express = require("express");
const { body } = require("express-validator");

const router = express.Router();


const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const {
  createBid,
  getMyBids,
  updateBid
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
 *       401:
 *         description: Unauthorized
 */

router.post(
  "/",
  authMiddleware,
  [
    body("bid_amount")
      .isFloat({ gt: 0 })
      .withMessage("Bid amount must be greater than 0"),
    body("bid_date")
      .isDate()
      .withMessage("Valid bid date is required")
  ],
  validate,
  createBid
);

/**
 * @swagger
 * /api/bids/me:
 *   get:
 *     summary: Get current user's bids
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bids
 *       401:
 *         description: Unauthorized
 */

router.get("/me", authMiddleware, getMyBids);

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
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BidUpdateRequest'
 *     responses:
 *       200:
 *         description: Bid updated successfully
 *       400:
 *         description: Validation error or bid amount decreased
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Bid not found
 */

router.put(
  "/:id",
  authMiddleware,
  [
    body("bid_amount")
      .optional()
      .isFloat({ gt: 0 })
      .withMessage("Bid amount must be greater than 0"),
    body("bid_date")
      .optional()
      .isDate()
      .withMessage("Valid bid date is required"),
    body("status")
      .optional()
      .isIn(["PENDING", "WON", "LOST"])
      .withMessage("Status must be PENDING, WON, or LOST")
  ],
  validate,
  updateBid
);


module.exports = router;