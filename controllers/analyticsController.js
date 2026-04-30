const { Op, fn, col, literal } = require("sequelize");
const {
  User,
  Profile,
  Degree,
  Certification,
  Licence,
  Course,
  EmploymentHistory,
  Bid,
  InfluencerDay
} = require("../models");

// ─── Helper: Get User Filters ──────────────────────────────────────
const getFilteredUserIds = async (query) => {
  const { degree, year, company, course } = query;
  if (!degree && !year && !company && !course) return null;

  const include = [];
  if (degree || year) {
    const degreeWhere = {};
    if (degree) degreeWhere.degree_name = { [Op.like]: `%${degree}%` };
    if (year) degreeWhere.year = year;
    include.push({ model: Degree, where: degreeWhere, attributes: [] });
  }

  if (company) {
    include.push({ model: EmploymentHistory, where: { company: { [Op.like]: `%${company}%` } }, attributes: [] });
  }

  if (course) {
    include.push({ model: Course, where: { course_name: { [Op.like]: `%${course}%` } }, attributes: [] });
  }

  const users = await User.findAll({
    attributes: ["id"],
    include,
    raw: true
  });

  return users.map(u => u.id);
};

// ─── Overview Stats ────────────────────────────────────────────────
exports.getOverview = async (req, res) => {
  try {
    const userIds = await getFilteredUserIds(req.query);
    const where = userIds ? { id: { [Op.in]: userIds } } : {};
    const relatedWhere = userIds ? { user_id: { [Op.in]: userIds } } : {};

    const totalAlumni = await User.count({ where });
    const verifiedAlumni = await User.count({ where: { ...where, verified: true } });
    const totalProfiles = await Profile.count({ where: relatedWhere });
    const totalBids = await Bid.count({ where: relatedWhere });
    const totalCertifications = await Certification.count({ where: relatedWhere });
    const totalCourses = await Course.count({ where: relatedWhere });
    const totalDegrees = await Degree.count({ where: relatedWhere });
    const totalEmployment = await EmploymentHistory.count({ where: relatedWhere });

    const today = new Date().toISOString().split("T")[0];
    const activeInfluencers = await InfluencerDay.count({
      where: { active_date: today, is_active: true }
    });

    const wonBids = await Bid.count({ where: { ...relatedWhere, status: "WON" } });
    const pendingBids = await Bid.count({
      where: { ...relatedWhere, status: "PENDING", cancelled: false }
    });

    res.json({
      totalAlumni,
      verifiedAlumni,
      totalProfiles,
      totalBids,
      wonBids,
      pendingBids,
      activeInfluencers,
      totalCertifications,
      totalCourses,
      totalDegrees,
      totalEmployment
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Certifications Analytics ──────────────────────────────────────
exports.getCertificationStats = async (req, res) => {
  try {
    const userIds = await getFilteredUserIds(req.query);
    const where = userIds ? { user_id: { [Op.in]: userIds } } : {};

    const stats = await Certification.findAll({
      where,
      attributes: [
        "title",
        "organization",
        [fn("COUNT", col("id")), "count"]
      ],
      group: ["title", "organization"],
      order: [[literal("count"), "DESC"]],
      limit: 15,
      raw: true
    });

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Courses Analytics ─────────────────────────────────────────────
exports.getCourseStats = async (req, res) => {
  try {
    const userIds = await getFilteredUserIds(req.query);
    const where = userIds ? { user_id: { [Op.in]: userIds } } : {};

    const stats = await Course.findAll({
      where,
      attributes: [
        "course_name",
        "provider",
        [fn("COUNT", col("id")), "count"]
      ],
      group: ["course_name", "provider"],
      order: [[literal("count"), "DESC"]],
      limit: 15,
      raw: true
    });

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Degree Distribution ───────────────────────────────────────────
exports.getDegreeStats = async (req, res) => {
  try {
    const userIds = await getFilteredUserIds(req.query);
    const where = userIds ? { user_id: { [Op.in]: userIds } } : {};

    const stats = await Degree.findAll({
      where,
      attributes: [
        "degree_name",
        "institution",
        [fn("COUNT", col("id")), "count"]
      ],
      group: ["degree_name", "institution"],
      order: [[literal("count"), "DESC"]],
      limit: 15,
      raw: true
    });

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Employment Analytics ──────────────────────────────────────────
exports.getEmploymentStats = async (req, res) => {
  try {
    const userIds = await getFilteredUserIds(req.query);
    const where = userIds ? { user_id: { [Op.in]: userIds } } : {};

    const byCompany = await EmploymentHistory.findAll({
      where,
      attributes: [
        "company",
        [fn("COUNT", col("id")), "count"]
      ],
      group: ["company"],
      order: [[literal("count"), "DESC"]],
      limit: 15,
      raw: true
    });

    const byRole = await EmploymentHistory.findAll({
      where,
      attributes: [
        "role",
        [fn("COUNT", col("id")), "count"]
      ],
      group: ["role"],
      order: [[literal("count"), "DESC"]],
      limit: 15,
      raw: true
    });

    res.json({ byCompany, byRole });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Skills Gap Analysis ───────────────────────────────────────────
exports.getSkillsGap = async (req, res) => {
  try {
    const userIds = await getFilteredUserIds(req.query);
    const where = userIds ? { user_id: { [Op.in]: userIds } } : {};

    const degrees = await Degree.findAll({
      where,
      attributes: [
        "degree_name",
        [fn("COUNT", col("id")), "count"]
      ],
      group: ["degree_name"],
      order: [[literal("count"), "DESC"]],
      limit: 8,
      raw: true
    });

    const certifications = await Certification.findAll({
      where,
      attributes: [
        "organization",
        [fn("COUNT", col("id")), "count"]
      ],
      group: ["organization"],
      order: [[literal("count"), "DESC"]],
      limit: 8,
      raw: true
    });

    const courses = await Course.findAll({
      where,
      attributes: [
        "provider",
        [fn("COUNT", col("id")), "count"]
      ],
      group: ["provider"],
      order: [[literal("count"), "DESC"]],
      limit: 8,
      raw: true
    });

    res.json({
      degrees,
      certifications,
      courses,
      insight: "Compares formal education (degrees) with post-graduation upskilling (certifications & courses)"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Trends Over Time ──────────────────────────────────────────────
exports.getTrends = async (req, res) => {
  try {
    const userIds = await getFilteredUserIds(req.query);
    const where = userIds ? { user_id: { [Op.in]: userIds } } : {};

    const certTrends = await Certification.findAll({
      where: { ...where, year: { [Op.ne]: null } },
      attributes: ["year", [fn("COUNT", col("id")), "count"]],
      group: ["year"],
      order: [["year", "ASC"]],
      raw: true
    });

    const courseTrends = await Course.findAll({
      where: { ...where, year: { [Op.ne]: null } },
      attributes: ["year", [fn("COUNT", col("id")), "count"]],
      group: ["year"],
      order: [["year", "ASC"]],
      raw: true
    });

    res.json({ certTrends, courseTrends });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Bid Activity ──────────────────────────────────────────────────
exports.getBidActivity = async (req, res) => {
  try {
    const userIds = await getFilteredUserIds(req.query);
    const where = userIds ? { user_id: { [Op.in]: userIds } } : {};

    const statusDist = await Bid.findAll({
      where: { ...where, cancelled: false },
      attributes: ["status", [fn("COUNT", col("id")), "count"]],
      group: ["status"],
      raw: true
    });

    const cancelledCount = await Bid.count({
      where: { ...where, cancelled: true }
    });

    const bidTimeline = await Bid.findAll({
      where: { ...where, cancelled: false },
      attributes: ["bid_date", [fn("COUNT", col("id")), "count"], [fn("SUM", col("bid_amount")), "total_amount"]],
      group: ["bid_date"],
      order: [["bid_date", "ASC"]],
      raw: true
    });

    res.json({
      statusDistribution: statusDist,
      cancelledCount,
      timeline: bidTimeline
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAlumniList = async (req, res) => {
  // Existing implementation remains mostly the same, but let's ensure it handles search properly
  try {
    const { page = 1, limit = 20, degree, year, company, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.findAndCountAll({
      where: { verified: true },
      attributes: ["id", "email", "created_at"],
      include: [{ model: Profile, attributes: ["full_name", "bio", "profile_image", "linkedin_url"], required: false }],
      limit: parseInt(limit),
      offset,
      order: [["id", "DESC"]]
    });

    const enrichedRows = await Promise.all(users.rows.map(async (user) => {
      const userData = user.toJSON();
      const degrees = await Degree.findAll({ where: { user_id: user.id }, attributes: ["degree_name", "institution", "year"], raw: true });
      const certifications = await Certification.findAll({ where: { user_id: user.id }, attributes: ["id", "title", "organization", "year", "sponsorship_amount"], raw: true });
      const courses = await Course.findAll({ where: { user_id: user.id }, attributes: ["id", "course_name", "provider", "year", "sponsorship_amount"], raw: true });
      const employment = await EmploymentHistory.findAll({ where: { user_id: user.id }, attributes: ["company", "role", "start_date", "end_date"], raw: true });
      return { ...userData, degrees, certifications, courses, employment };
    }));

    let filtered = enrichedRows;
    if (degree) filtered = filtered.filter(u => u.degrees.some(d => d.degree_name.toLowerCase().includes(degree.toLowerCase())));
    if (year) filtered = filtered.filter(u => u.degrees.some(d => d.year === parseInt(year)));
    if (company) filtered = filtered.filter(u => u.employment.some(e => e.company.toLowerCase().includes(company.toLowerCase())));
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(u => u.email.toLowerCase().includes(s) || (u.Profile?.full_name && u.Profile.full_name.toLowerCase().includes(s)));
    }

    res.json({ total: users.count, filtered: filtered.length, page: parseInt(page), limit: parseInt(limit), alumni: filtered });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
