const {
  Profile,
  Degree,
  Certification,
  Licence,
  Course,
  EmploymentHistory
} = require("../models");

exports.createProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, bio, profile_image, linkedin_url } = req.body;

    const existing = await Profile.findOne({ where: { user_id: userId } });

    if (existing) {
      return res.status(400).json({
        message: "Profile already exists"
      });
    }

    await Profile.create({
      user_id: userId,
      full_name,
      bio,
      profile_image,
      linkedin_url
    });

    res.status(201).json({
      message: "Profile created successfully"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      where: { user_id: req.user.id }
    });

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found"
      });
    }

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.getMyFullProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await Profile.findOne({
      where: { user_id: userId }
    });

    const degrees = await Degree.findAll({
      where: { user_id: userId },
      order: [["id", "DESC"]]
    });

    const certifications = await Certification.findAll({
      where: { user_id: userId },
      order: [["id", "DESC"]]
    });

    const licences = await Licence.findAll({
      where: { user_id: userId },
      order: [["id", "DESC"]]
    });

    const courses = await Course.findAll({
      where: { user_id: userId },
      order: [["id", "DESC"]]
    });

    const employment = await EmploymentHistory.findAll({
      where: { user_id: userId },
      order: [["id", "DESC"]]
    });

    res.json({
      profile,
      degrees,
      certifications,
      licences,
      courses,
      employment
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const { full_name, bio, profile_image, linkedin_url } = req.body;

    const profile = await Profile.findOne({
      where: { user_id: req.user.id }
    });

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found"
      });
    }

    await profile.update({
      full_name,
      bio,
      profile_image,
      linkedin_url
    });

    res.json({
      message: "Profile updated successfully"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.updateLinkedIn = async (req, res) => {
  try {
    const { linkedin_url } = req.body;

    const profile = await Profile.findOne({
      where: { user_id: req.user.id }
    });

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found"
      });
    }

    await profile.update({ linkedin_url });

    res.json({
      message: "LinkedIn URL updated successfully"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.getProfileCompletion = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await Profile.findOne({ where: { user_id: userId } });
    const degreeCount = await Degree.count({ where: { user_id: userId } });
    const certCount = await Certification.count({ where: { user_id: userId } });
    const licenceCount = await Licence.count({ where: { user_id: userId } });
    const courseCount = await Course.count({ where: { user_id: userId } });
    const employmentCount = await EmploymentHistory.count({ where: { user_id: userId } });

    let completed = 0;
    const total = 9;

    if (profile?.full_name) completed++;
    if (profile?.bio) completed++;
    if (profile?.profile_image) completed++;
    if (profile?.linkedin_url) completed++;
    if (degreeCount > 0) completed++;
    if (certCount > 0) completed++;
    if (licenceCount > 0) completed++;
    if (courseCount > 0) completed++;
    if (employmentCount > 0) completed++;

    const percentage = Math.round((completed / total) * 100);

    res.json({
      completedItems: completed,
      totalItems: total,
      percentage,
      details: {
        full_name: !!profile?.full_name,
        bio: !!profile?.bio,
        profile_image: !!profile?.profile_image,
        linkedin_url: !!profile?.linkedin_url,
        degrees: degreeCount > 0,
        certifications: certCount > 0,
        licences: licenceCount > 0,
        courses: courseCount > 0,
        employment_history: employmentCount > 0
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};