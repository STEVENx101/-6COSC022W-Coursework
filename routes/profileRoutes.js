const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  createProfile,
  getMyProfile,
  updateMyProfile
} = require("../controllers/profileController");

router.post("/", authMiddleware, createProfile);
router.get("/me", authMiddleware, getMyProfile);
router.put("/me", authMiddleware, updateMyProfile);

module.exports = router;