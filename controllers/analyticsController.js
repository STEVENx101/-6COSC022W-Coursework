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

// ─── Overview Stats ────────────────────────────────────────────────
// Returns high-level dashboard KPIs: total alumni, verified count,
// total bids, active influencer count, etc.
exports.getOverview = async (req, res) => {
  try {
    const totalAlumni = await User.count();
    const verifiedAlumni = await User.count({ where: { verified: true } });
    const totalProfiles = await Profile.count();
    const totalBids = await Bid.count();
    const totalCertifications = await Certification.count();
    const totalCourses = await Course.count();
    const totalDegrees = await Degree.count();
    const totalEmployment = await EmploymentHistory.count();

    const today = new Date().toISOString().split("T")[0];
    const activeInfluencers = await InfluencerDay.count({
      where: { active_date: today, is_active: true }
    });

    const wonBids = await Bid.count({ where: { status: "WON" } });
    const pendingBids = await Bid.count({
      where: { status: "PENDING", cancelled: false }
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
// Returns top certifications grouped by title + organization,
// ordered by count descending. Used for bar charts.
exports.getCertificationStats = async (req, res) => {
  try {
    const stats = await Certification.findAll({
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
// Returns top courses grouped by course_name + provider,
// ordered by count descending. Used for bar charts.
exports.getCourseStats = async (req, res) => {
  try {
    const stats = await Course.findAll({
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
// Returns degree programmes grouped by name, used for pie charts.
exports.getDegreeStats = async (req, res) => {
  try {
    const stats = await Degree.findAll({
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
// Returns employment grouped by company and role,
// used for doughnut charts showing industry distribution.
exports.getEmploymentStats = async (req, res) => {
  try {
    // Group by company for industry distribution
    const byCompany = await EmploymentHistory.findAll({
      attributes: [
        "company",
        [fn("COUNT", col("id")), "count"]
      ],
      group: ["company"],
      order: [[literal("count"), "DESC"]],
      limit: 15,
      raw: true
    });

    // Group by role for role distribution
    const byRole = await EmploymentHistory.findAll({
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
// Compares degree programmes against certifications acquired,
// highlighting where graduates are self-upskilling.
// Used for radar charts to visualize curriculum vs market alignment.
exports.getSkillsGap = async (req, res) => {
  try {
    // Get degree programme distribution
    const degrees = await Degree.findAll({
      attributes: [
        "degree_name",
        [fn("COUNT", col("id")), "count"]
      ],
      group: ["degree_name"],
      order: [[literal("count"), "DESC"]],
      limit: 8,
      raw: true
    });

    // Get certification categories (group by organization as proxy for skill category)
    const certifications = await Certification.findAll({
      attributes: [
        "organization",
        [fn("COUNT", col("id")), "count"]
      ],
      group: ["organization"],
      order: [[literal("count"), "DESC"]],
      limit: 8,
      raw: true
    });

    // Get course providers as additional dimension
    const courses = await Course.findAll({
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
// Returns certifications and courses aggregated by year,
// showing how professional development activity changes over time.
// Used for line charts.
exports.getTrends = async (req, res) => {
  try {
    // Certifications by year
    const certTrends = await Certification.findAll({
      attributes: [
        "year",
        [fn("COUNT", col("id")), "count"]
      ],
      where: {
        year: { [Op.ne]: null }
      },
      group: ["year"],
      order: [["year", "ASC"]],
      raw: true
    });

    // Courses by year
    const courseTrends = await Course.findAll({
      attributes: [
        "year",
        [fn("COUNT", col("id")), "count"]
      ],
      where: {
        year: { [Op.ne]: null }
      },
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
// Returns bid counts grouped by status and by date,
// used for bar/line charts showing bidding activity.
exports.getBidActivity = async (req, res) => {
  try {
    // Bid status distribution
    const statusDist = await Bid.findAll({
      attributes: [
        "status",
        [fn("COUNT", col("id")), "count"]
      ],
      where: { cancelled: false },
      group: ["status"],
      raw: true
    });

    // Cancelled bids count
    const cancelledCount = await Bid.count({
      where: { cancelled: true }
    });

    // Bids over time (by bid_date)
    const bidTimeline = await Bid.findAll({
      attributes: [
        "bid_date",
        [fn("COUNT", col("id")), "count"],
        [fn("SUM", col("bid_amount")), "total_amount"]
      ],
      where: { cancelled: false },
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

// ─── Alumni Directory ──────────────────────────────────────────────
// Returns a paginated list of alumni with their profiles,
// filterable by degree programme, graduation year, and industry (company).
exports.getAlumniList = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      degree,
      year,
      company,
      search
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build filter conditions for the User table
    const userWhere = { verified: true };

    if (search) {
      // We'll filter by profile name or email later
    }

    // Get all verified users with their profiles
    const users = await User.findAndCountAll({
      where: userWhere,
      attributes: ["id", "email", "created_at"],
      include: [
        {
          model: Profile,
          attributes: ["full_name", "bio", "profile_image", "linkedin_url"],
          required: false
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [["id", "DESC"]]
    });

    // For each user, fetch their degrees, certifications, and employment
    const enrichedRows = await Promise.all(
      users.rows.map(async (user) => {
        const userData = user.toJSON();

        const degrees = await Degree.findAll({
          where: { user_id: user.id },
          attributes: ["degree_name", "institution", "year"],
          raw: true
        });

        const certifications = await Certification.findAll({
          where: { user_id: user.id },
          attributes: ["id", "title", "organization", "year", "sponsorship_amount"],
          raw: true
        });

        const courses = await Course.findAll({
          where: { user_id: user.id },
          attributes: ["id", "course_name", "provider", "year", "sponsorship_amount"],
          raw: true
        });

        const employment = await EmploymentHistory.findAll({
          where: { user_id: user.id },
          attributes: ["company", "role", "start_date", "end_date"],
          raw: true
        });

        return {
          ...userData,
          degrees,
          certifications,
          courses,
          employment
        };
      })
    );

    // Apply client-side filters (degree, year, company) since they span related tables
    let filtered = enrichedRows;

    if (degree) {
      filtered = filtered.filter(u =>
        u.degrees.some(d =>
          d.degree_name.toLowerCase().includes(degree.toLowerCase())
        )
      );
    }

    if (year) {
      filtered = filtered.filter(u =>
        u.degrees.some(d => d.year === parseInt(year))
      );
    }

    if (company) {
      filtered = filtered.filter(u =>
        u.employment.some(e =>
          e.company.toLowerCase().includes(company.toLowerCase())
        )
      );
    }

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(u =>
        u.email.toLowerCase().includes(s) ||
        (u.Profile?.full_name && u.Profile.full_name.toLowerCase().includes(s))
      );
    }

    res.json({
      total: users.count,
      filtered: filtered.length,
      page: parseInt(page),
      limit: parseInt(limit),
      alumni: filtered
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
