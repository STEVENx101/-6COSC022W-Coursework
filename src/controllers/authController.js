const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const crypto = require("crypto");

exports.registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (!email.endsWith("@westminster.ac.uk")) {
      return res.status(400).json({
        message: "Must use university email"
      });
    }

    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, hashedPassword]
    );

    const userId = result.insertId;

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + 10 * 60 * 1000; // 10 mins

    await db.query(
      "INSERT INTO verification_tokens (user_id, token, expires) VALUES (?, ?, ?)",
      [userId, token, expires]
    );

    res.status(201).json({
      message: "User registered. Please verify email.",
      verificationLink: `http://localhost:5000/api/auth/verify/${token}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM verification_tokens WHERE token = ?",
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid token" });
    }

    const record = rows[0];

    if (record.expires < Date.now()) {
      return res.status(400).json({ message: "Token expired" });
    }

    await db.query(
      "UPDATE users SET verified = true WHERE id = ?",
      [record.user_id]
    );

    await db.query(
      "DELETE FROM verification_tokens WHERE user_id = ?",
      [record.user_id]
    );

    res.json({ message: "Email verified successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const user = rows[0];

    // 🔴 ADD THIS (EMAIL VERIFICATION CHECK)
    if (!user.verified) {
      return res.status(403).json({
        message: "Please verify your email first"
      });
    }

    // Password check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};