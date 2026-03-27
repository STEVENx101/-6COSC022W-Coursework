const db = require("../config/db");

exports.createProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, bio, profile_image } = req.body;

    const [existing] = await db.query(
      "SELECT id FROM profiles WHERE user_id = ?",
      [userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "Profile already exists"
      });
    }

    await db.query(
      "INSERT INTO profiles (user_id, full_name, bio, profile_image) VALUES (?, ?, ?, ?)",
      [userId, full_name || null, bio || null, profile_image || null]
    );

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
    const userId = req.user.id;

    const [rows] = await db.query(
      "SELECT * FROM profiles WHERE user_id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Profile not found"
      });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, bio, profile_image } = req.body;

    const [existing] = await db.query(
      "SELECT id FROM profiles WHERE user_id = ?",
      [userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        message: "Profile not found"
      });
    }

    await db.query(
      `UPDATE profiles 
       SET full_name = ?, bio = ?, profile_image = ?
       WHERE user_id = ?`,
      [full_name || null, bio || null, profile_image || null, userId]
    );

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