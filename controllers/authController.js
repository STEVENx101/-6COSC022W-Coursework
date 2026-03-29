const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { User, VerificationToken, PasswordResetToken } = require("../models");

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
      password: hashedPassword
    });

    const token = crypto.randomBytes(32).toString("hex");

    await VerificationToken.create({
      user_id: user.id,
      token,
      expires: Date.now() + 10 * 60 * 1000
    });

    res.status(201).json({
      message: "User registered. Please verify email.",
      verificationLink: `${process.env.CLIENT_URL}/api/auth/verify/${token}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const record = await VerificationToken.findOne({ where: { token } });

    if (!record) {
      return res.status(400).send("<h2>Invalid token</h2>");
    }

    if (record.expires < Date.now()) {
      return res.status(400).send("<h2>Token expired</h2>");
    }

    await User.update(
      { verified: true },
      { where: { id: record.user_id } }
    );

    await VerificationToken.destroy({ where: { user_id: record.user_id } });

    res.send(`
      <h2>Email verified successfully</h2>
      <p>Redirecting to login...</p>
      <script>
        setTimeout(() => {
          window.location.href = "/index.html";
        }, 1200);
      </script>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("<h2>Server error</h2>");
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
      return res.status(403).json({ message: "Please verify your email first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};