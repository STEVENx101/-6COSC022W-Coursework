const crypto = require("crypto");
const { ApiKey, ApiKeyLog } = require("../models");

// Generate a cryptographically random 64-character hex API key
function generateKey() {
  return crypto.randomBytes(32).toString("hex");
}

// Valid permissions that can be assigned to API keys
const VALID_PERMISSIONS = [
  "read:alumni",
  "read:analytics",
  "read:alumni_of_day"
];

// ─── Generate API Key ──────────────────────────────────────────────
// Creates a new API key with scoped permissions and a client name.
// The caller specifies which permissions (scopes) this key should have
// and a human-readable name for the client application.
exports.generateApiKey = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      client_name = "Default Client",
      permissions = ["read:alumni"]
    } = req.body;

    // Validate permissions
    const invalidPerms = permissions.filter(p => !VALID_PERMISSIONS.includes(p));
    if (invalidPerms.length > 0) {
      return res.status(400).json({
        message: "Invalid permissions: " + invalidPerms.join(", "),
        validPermissions: VALID_PERMISSIONS
      });
    }

    const apiKey = await ApiKey.create({
      user_id: userId,
      api_key: generateKey(),
      client_name,
      permissions,
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

// ─── Get My API Keys ───────────────────────────────────────────────
// Returns all API keys owned by the authenticated user,
// including their permissions, usage count, and status.
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

// ─── Revoke API Key ────────────────────────────────────────────────
// Deactivates an API key so it can no longer be used for authentication.
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

// ─── Get API Key Stats ─────────────────────────────────────────────
// Returns detailed usage statistics for a specific API key,
// including the total usage count, permissions, and creation date.
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
      client_name: key.client_name,
      permissions: key.permissions,
      is_active: key.is_active,
      usage_count: key.usage_count,
      last_used_at: key.last_used_at,
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

// ─── Get API Key Usage Logs ────────────────────────────────────────
// Returns the access log for a specific API key — which endpoints were
// hit, when, from which IP, etc. Supports the CW2 requirement for
// "viewing usage statistics i.e. timestamps and endpoints accessed."
exports.getApiKeyLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify ownership
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

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const logs = await ApiKeyLog.findAndCountAll({
      where: { api_key_id: id },
      order: [["id", "DESC"]],
      limit: parseInt(limit),
      offset
    });

    res.json({
      apiKeyId: parseInt(id),
      client_name: key.client_name,
      total: logs.count,
      page: parseInt(page),
      limit: parseInt(limit),
      logs: logs.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

// ─── Get Valid Permissions ─────────────────────────────────────────
// Returns the list of valid permission scopes that can be assigned to keys.
exports.getValidPermissions = async (req, res) => {
  res.json({
    permissions: VALID_PERMISSIONS,
    description: {
      "read:alumni": "Access alumni profile data and directory",
      "read:analytics": "Access analytics and chart data endpoints",
      "read:alumni_of_day": "Access influencer of the day endpoint"
    }
  });
};