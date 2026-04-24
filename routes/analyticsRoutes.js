const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const apiKeyMiddleware = require("../middleware/apiKeyMiddleware");

const {
  getOverview,
  getCertificationStats,
  getCourseStats,
  getDegreeStats,
  getEmploymentStats,
  getSkillsGap,
  getTrends,
  getBidActivity,
  getAlumniList
} = require("../controllers/analyticsController");

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: University Analytics & Intelligence Dashboard endpoints
 */

/**
 * @swagger
 * /api/analytics/overview:
 *   get:
 *     summary: Get dashboard overview statistics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Overview stats including total alumni, bids, certifications, etc.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get("/overview", authMiddleware, apiKeyMiddleware("read:analytics"), getOverview);

/**
 * @swagger
 * /api/analytics/certifications:
 *   get:
 *     summary: Get top certifications by count
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Certification distribution data for charts
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get("/certifications", authMiddleware, apiKeyMiddleware("read:analytics"), getCertificationStats);

/**
 * @swagger
 * /api/analytics/courses:
 *   get:
 *     summary: Get top courses by count
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Course distribution data for charts
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get("/courses", authMiddleware, apiKeyMiddleware("read:analytics"), getCourseStats);

/**
 * @swagger
 * /api/analytics/degrees:
 *   get:
 *     summary: Get degree programme distribution
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Degree distribution data for pie charts
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get("/degrees", authMiddleware, apiKeyMiddleware("read:analytics"), getDegreeStats);

/**
 * @swagger
 * /api/analytics/employment:
 *   get:
 *     summary: Get employment statistics by company and role
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Employment distribution data for doughnut charts
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get("/employment", authMiddleware, apiKeyMiddleware("read:analytics"), getEmploymentStats);

/**
 * @swagger
 * /api/analytics/skills-gap:
 *   get:
 *     summary: Get skills gap analysis comparing degrees vs certifications
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Skills gap data for radar charts
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get("/skills-gap", authMiddleware, apiKeyMiddleware("read:analytics"), getSkillsGap);

/**
 * @swagger
 * /api/analytics/trends:
 *   get:
 *     summary: Get certification and course trends over time
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Trend data (by year) for line charts
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get("/trends", authMiddleware, apiKeyMiddleware("read:analytics"), getTrends);

/**
 * @swagger
 * /api/analytics/bid-activity:
 *   get:
 *     summary: Get bid activity and status distribution
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Bid activity data for bar/line charts
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get("/bid-activity", authMiddleware, apiKeyMiddleware("read:analytics"), getBidActivity);

/**
 * @swagger
 * /api/analytics/alumni:
 *   get:
 *     summary: Get alumni directory with filters
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page (default 20)
 *       - in: query
 *         name: degree
 *         schema:
 *           type: string
 *         description: Filter by degree programme name
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by graduation year
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *         description: Filter by employment company / industry
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: Paginated alumni list with profiles and credentials
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get("/alumni", authMiddleware, apiKeyMiddleware("read:alumni"), getAlumniList);

module.exports = router;
