const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const {
  createProfile,
  getMyProfile,
  getMyFullProfile,
  updateMyProfile,
  updateLinkedIn,
  getProfileCompletion
} = require("../controllers/profileController");

const {
  createDegree,
  getMyDegrees,
  updateDegree,
  deleteDegree
} = require("../controllers/degreeController");

const {
  createCertification,
  getMyCertifications,
  updateCertification,
  deleteCertification
} = require("../controllers/certificationController");

const {
  createLicence,
  getMyLicences,
  updateLicence,
  deleteLicence
} = require("../controllers/licenceController");

const {
  createCourse,
  getMyCourses,
  updateCourse,
  deleteCourse
} = require("../controllers/courseController");

const {
  createEmployment,
  getMyEmployment,
  updateEmployment,
  deleteEmployment
} = require("../controllers/employmentController");

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: Profile and related details management
 */

const profileValidation = [
  body("full_name").optional().isLength({ max: 255 }),
  body("bio").optional().isLength({ max: 2000 }),
  body("profile_image").optional().isLength({ max: 255 }),
  body("linkedin_url").optional().isLength({ max: 255 })
];

/* =========================
   PROFILE
========================= */

/**
 * @swagger
 * /api/profile:
 *   post:
 *     summary: Create a profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileRequest'
 *     responses:
 *       201:
 *         description: Profile created successfully
 *       400:
 *         description: Profile already exists
 *       401:
 *         description: Unauthorized
 */
router.post("/", authMiddleware, profileValidation, validate, createProfile);

/**
 * @swagger
 * /api/profile/me:
 *   get:
 *     summary: Get my basic profile
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
 * /api/profile/me/full:
 *   get:
 *     summary: Get my full profile with degrees, certifications, licences, courses, and employment
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Full profile fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/me/full", authMiddleware, getMyFullProfile);

/**
 * @swagger
 * /api/profile/me:
 *   put:
 *     summary: Update my profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 */
router.put("/me", authMiddleware, profileValidation, validate, updateMyProfile);

/**
 * @swagger
 * /api/profile/me/linkedin:
 *   put:
 *     summary: Update LinkedIn URL
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               linkedin_url:
 *                 type: string
 *                 example: https://www.linkedin.com/in/januda
 *     responses:
 *       200:
 *         description: LinkedIn URL updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 */
router.put(
  "/me/linkedin",
  authMiddleware,
  [body("linkedin_url").notEmpty().withMessage("LinkedIn URL is required")],
  validate,
  updateLinkedIn
);

/**
 * @swagger
 * /api/profile/me/completion:
 *   get:
 *     summary: Get profile completion percentage
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile completion fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/me/completion", authMiddleware, getProfileCompletion);

/* =========================
   DEGREES
========================= */

/**
 * @swagger
 * /api/profile/degrees:
 *   post:
 *     summary: Add a degree
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DegreeRequest'
 *     responses:
 *       201:
 *         description: Degree created successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/degrees",
  authMiddleware,
  [
    body("degree_name").notEmpty().withMessage("Degree name is required"),
    body("institution").notEmpty().withMessage("Institution is required")
  ],
  validate,
  createDegree
);

/**
 * @swagger
 * /api/profile/degrees:
 *   get:
 *     summary: Get my degrees
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Degrees fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/degrees", authMiddleware, getMyDegrees);

/**
 * @swagger
 * /api/profile/degrees/{id}:
 *   put:
 *     summary: Update a degree
 *     tags: [Profile]
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
 *             $ref: '#/components/schemas/DegreeRequest'
 *     responses:
 *       200:
 *         description: Degree updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Degree not found
 */
router.put("/degrees/:id", authMiddleware, validate, updateDegree);

/**
 * @swagger
 * /api/profile/degrees/{id}:
 *   delete:
 *     summary: Delete a degree
 *     tags: [Profile]
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
 *         description: Degree deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Degree not found
 */
router.delete("/degrees/:id", authMiddleware, deleteDegree);

/* =========================
   CERTIFICATIONS
========================= */

/**
 * @swagger
 * /api/profile/certifications:
 *   post:
 *     summary: Add a certification
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CertificationRequest'
 *     responses:
 *       201:
 *         description: Certification created successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/certifications",
  authMiddleware,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("organization").notEmpty().withMessage("Organization is required")
  ],
  validate,
  createCertification
);

/**
 * @swagger
 * /api/profile/certifications:
 *   get:
 *     summary: Get my certifications
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Certifications fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/certifications", authMiddleware, getMyCertifications);

/**
 * @swagger
 * /api/profile/certifications/{id}:
 *   put:
 *     summary: Update a certification
 *     tags: [Profile]
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
 *             $ref: '#/components/schemas/CertificationRequest'
 *     responses:
 *       200:
 *         description: Certification updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Certification not found
 */
router.put("/certifications/:id", authMiddleware, validate, updateCertification);

/**
 * @swagger
 * /api/profile/certifications/{id}:
 *   delete:
 *     summary: Delete a certification
 *     tags: [Profile]
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
 *         description: Certification deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Certification not found
 */
router.delete("/certifications/:id", authMiddleware, deleteCertification);

/* =========================
   LICENCES
========================= */

/**
 * @swagger
 * /api/profile/licences:
 *   post:
 *     summary: Add a licence
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LicenceRequest'
 *     responses:
 *       201:
 *         description: Licence created successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/licences",
  authMiddleware,
  [body("title").notEmpty().withMessage("Title is required")],
  validate,
  createLicence
);

/**
 * @swagger
 * /api/profile/licences:
 *   get:
 *     summary: Get my licences
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Licences fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/licences", authMiddleware, getMyLicences);

/**
 * @swagger
 * /api/profile/licences/{id}:
 *   put:
 *     summary: Update a licence
 *     tags: [Profile]
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
 *             $ref: '#/components/schemas/LicenceRequest'
 *     responses:
 *       200:
 *         description: Licence updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Licence not found
 */
router.put("/licences/:id", authMiddleware, validate, updateLicence);

/**
 * @swagger
 * /api/profile/licences/{id}:
 *   delete:
 *     summary: Delete a licence
 *     tags: [Profile]
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
 *         description: Licence deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Licence not found
 */
router.delete("/licences/:id", authMiddleware, deleteLicence);

/* =========================
   COURSES
========================= */

/**
 * @swagger
 * /api/profile/courses:
 *   post:
 *     summary: Add a course
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseRequest'
 *     responses:
 *       201:
 *         description: Course created successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/courses",
  authMiddleware,
  [body("course_name").notEmpty().withMessage("Course name is required")],
  validate,
  createCourse
);

/**
 * @swagger
 * /api/profile/courses:
 *   get:
 *     summary: Get my courses
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Courses fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/courses", authMiddleware, getMyCourses);

/**
 * @swagger
 * /api/profile/courses/{id}:
 *   put:
 *     summary: Update a course
 *     tags: [Profile]
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
 *             $ref: '#/components/schemas/CourseRequest'
 *     responses:
 *       200:
 *         description: Course updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course not found
 */
router.put("/courses/:id", authMiddleware, validate, updateCourse);

/**
 * @swagger
 * /api/profile/courses/{id}:
 *   delete:
 *     summary: Delete a course
 *     tags: [Profile]
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
 *         description: Course deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course not found
 */
router.delete("/courses/:id", authMiddleware, deleteCourse);

/* =========================
   EMPLOYMENT
========================= */

/**
 * @swagger
 * /api/profile/employment:
 *   post:
 *     summary: Add an employment history record
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmploymentRequest'
 *     responses:
 *       201:
 *         description: Employment record created successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/employment",
  authMiddleware,
  [
    body("company").notEmpty().withMessage("Company is required"),
    body("role").notEmpty().withMessage("Role is required")
  ],
  validate,
  createEmployment
);

/**
 * @swagger
 * /api/profile/employment:
 *   get:
 *     summary: Get my employment history
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employment records fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/employment", authMiddleware, getMyEmployment);

/**
 * @swagger
 * /api/profile/employment/{id}:
 *   put:
 *     summary: Update an employment history record
 *     tags: [Profile]
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
 *             $ref: '#/components/schemas/EmploymentRequest'
 *     responses:
 *       200:
 *         description: Employment record updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employment record not found
 */
router.put("/employment/:id", authMiddleware, validate, updateEmployment);

/**
 * @swagger
 * /api/profile/employment/{id}:
 *   delete:
 *     summary: Delete an employment history record
 *     tags: [Profile]
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
 *         description: Employment record deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employment record not found
 */
router.delete("/employment/:id", authMiddleware, deleteEmployment);

module.exports = router;