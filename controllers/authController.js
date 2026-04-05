const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");


const {
  User,
  VerificationToken,
  PasswordResetToken,
  BlacklistedToken 
} = require("../models");

const sendEmail = require("../utils/sendEmail");
exports.logoutUser = async (req, res) => {
  try {
    const token = req.token;

    if (!token) {
      return res.status(400).json({
        message: "No active session found"
      });
    }

    const decoded = jwt.decode(token);

    await BlacklistedToken.create({
      token,
      expires_at: decoded.exp * 1000
    });

    return res.json({
      message: "Logged out successfully"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error"
    });
  }
};


exports.registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (!email.endsWith("@my.westminster.ac.uk")) {
      return res.status(400).json({ message: "Must use university email" });
    }

    const existing = await User.findOne({ where: { email } });

    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      verified: false
    });

    // store raw token in DB
    const rawToken = crypto.randomBytes(16).toString("hex");

    // send formatted token to user
    const formattedToken = rawToken.match(/.{1,4}/g).join("-").toUpperCase();

    await VerificationToken.create({
      user_id: user.id,
      token: rawToken,
      expires: Date.now() + 10 * 60 * 1000
    });

    try {
      await sendEmail(
        email,
        "🔐 Email Verification Code",
        `
          <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
            <h2>Verify Your Email</h2>
            <p>Welcome to the Alumni Platform 🎓</p>
            <p>Your verification code is:</p>
            <h1 style="letter-spacing: 5px; color: #007bff; margin: 20px 0;">
              ${formattedToken}
            </h1>
            <p>This code will expire in 10 minutes.</p>
            <p>Enter this code in the system to verify your account.</p>
          </div>
        `
      );

      return res.status(201).json({
        message: "User registered successfully. Verification email sent."
      });
    } catch (mailErr) {
      console.error("Mail error:", mailErr.message);

      return res.status(201).json({
        message: "User registered, but verification email could not be sent.",
        verificationToken: formattedToken
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    const cleanToken = token.replace(/-/g, "").toLowerCase();

    const record = await VerificationToken.findOne({
      where: { token: cleanToken }
    });

    if (!record) {
      return res.status(400).json({ message: "Invalid token" });
    }

    if (record.expires < Date.now()) {
      return res.status(400).json({ message: "Token expired" });
    }

    await User.update(
      { verified: true },
      { where: { id: record.user_id } }
    );

    await VerificationToken.destroy({
      where: { user_id: record.user_id }
    });

    return res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.verified) {
      return res.status(403).json({
        message: "Please verify your email first"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    return res.json({
      message: "Login successful",
      token
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + 10 * 60 * 1000;

    await PasswordResetToken.destroy({
      where: { user_id: user.id }
    });

    await PasswordResetToken.create({
      user_id: user.id,
      token,
      expires
    });

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    try {
      await sendEmail(
        user.email,
        "Password Reset Request",
        `
          <h2>Password Reset</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>This link expires in 10 minutes.</p>
        `
      );
    } catch (mailErr) {
      console.error("Mail error:", mailErr.message);

      return res.json({
        message: "Reset token generated but email could not be sent",
        resetLink
      });
    }

    return res.json({
      message: "Password reset link sent to email"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token and new password are required"
      });
    }

    const record = await PasswordResetToken.findOne({
      where: { token }
    });

    if (!record) {
      return res.status(400).json({ message: "Invalid token" });
    }

    if (record.expires < Date.now()) {
      return res.status(400).json({ message: "Token expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.update(
      { password: hashedPassword },
      { where: { id: record.user_id } }
    );

    await PasswordResetToken.destroy({
      where: { user_id: record.user_id }
    });

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};