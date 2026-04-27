const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests from this IP, please try again later."
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts, please try again later."
  }
});

module.exports = {
  apiLimiter,
  authLimiter
};