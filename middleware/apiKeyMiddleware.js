const { ApiKey } = require("../models");

module.exports = async (req, res, next) => {
  try {
    const apiKeyValue = req.headers["x-api-key"];

    if (!apiKeyValue) {
      return res.status(401).json({
        message: "API key is required"
      });
    }

    const key = await ApiKey.findOne({
      where: {
        api_key: apiKeyValue,
        is_active: true
      }
    });

    if (!key) {
      return res.status(401).json({
        message: "Invalid or revoked API key"
      });
    }

    await key.update({
      usage_count: key.usage_count + 1
    });

    req.apiKey = key;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};