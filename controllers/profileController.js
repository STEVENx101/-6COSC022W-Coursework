const { Profile } = require("../models");

exports.createProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, bio, profile_image } = req.body;

    const existing = await Profile.findOne({ where: { user_id: userId } });

    if (existing) {
      return res.status(400).json({ message: "Profile already exists" });
    }

    await Profile.create({
      user_id: userId,
      full_name,
      bio,
      profile_image
    });

    res.status(201).json({ message: "Profile created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      where: { user_id: req.user.id }
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const { full_name, bio, profile_image } = req.body;

    const profile = await Profile.findOne({
      where: { user_id: req.user.id }
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    await profile.update({
      full_name,
      bio,
      profile_image
    });

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};