const crypto = require("crypto");
const { ApiKey } = require("../models");

function generateKey() {
  return crypto.randomBytes(32).toString("hex");
}

exports.generateApiKey = async (req, res) => {
  try {
    const userId = req.user.id;

    const apiKey = await ApiKey.create({
      user_id: userId,
      api_key: generateKey(),
      is_active: true,
      usage_count: 0
    });

    res.status(201).json({
      message: "API key generated successfully",
      key: apiKey
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.getMyApiKeys = async (req, res) => {
  try {
    const keys = await ApiKey.findAll({
      where: { user_id: req.user.id },
      order: [["id", "DESC"]]
    });

    res.json(keys);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.revokeApiKey = async (req, res) => {
  try {
    const { id } = req.params;

    const key = await ApiKey.findOne({
      where: {
        id,
        user_id: req.user.id
      }
    });

    if (!key) {
      return res.status(404).json({
        message: "API key not found"
      });
    }

    if (!key.is_active) {
      return res.status(400).json({
        message: "API key already revoked"
      });
    }

    await key.update({
      is_active: false,
      revoked_at: new Date()
    });

    res.json({
      message: "API key revoked successfully",
      key
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

exports.getApiKeyStats = async (req, res) => {
  try {
    const { id } = req.params;

    const key = await ApiKey.findOne({
      where: {
        id,
        user_id: req.user.id
      }
    });

    if (!key) {
      return res.status(404).json({
        message: "API key not found"
      });
    }

    res.json({
      id: key.id,
      is_active: key.is_active,
      usage_count: key.usage_count,
      created_at: key.created_at,
      revoked_at: key.revoked_at
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};