const jwt = require("jsonwebtoken");
const { BlacklistedToken } = require("../models");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "No token provided"
    });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  try {
    const blacklisted = await BlacklistedToken.findOne({
      where: { token }
    });

    if (blacklisted) {
      return res.status(401).json({
        message: "Session expired. Please login again."
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.token = token;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Session expired. Please login again."
      });
    }

    return res.status(401).json({
      message: "Invalid token"
    });
  }
};