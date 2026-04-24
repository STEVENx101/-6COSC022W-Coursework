const { ApiKey, ApiKeyLog } = require("../models");

// Factory function that returns middleware enforcing a specific permission scope.
// Usage: apiKeyMiddleware("read:analytics") — will reject keys that don't have
// the "read:analytics" permission in their permissions array.
// If no permission is specified, any valid active key is accepted.
function apiKeyMiddleware(requiredPermission) {
  return async (req, res, next) => {
    try {
      const apiKeyValue = req.headers["x-api-key"];

      if (!apiKeyValue) {
        return res.status(401).json({
          message: "API key is required. Pass it via the x-api-key header."
        });
      }

      // Look up the key in the database — must be active
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

      // Check permission scope if a specific permission is required
      if (requiredPermission) {
        const permissions = key.permissions || [];
        if (!permissions.includes(requiredPermission)) {
          return res.status(403).json({
            message: `Forbidden: this API key does not have the '${requiredPermission}' permission`,
            required: requiredPermission,
            granted: permissions
          });
        }
      }

      // Update usage statistics
      await key.update({
        usage_count: key.usage_count + 1,
        last_used_at: new Date()
      });

      // Log this API key usage for audit trail
      try {
        await ApiKeyLog.create({
          api_key_id: key.id,
          endpoint: req.originalUrl,
          method: req.method,
          ip_address: req.ip || req.connection?.remoteAddress || "unknown"
        });
      } catch (logErr) {
        // Don't block the request if logging fails
        console.error("API key log error:", logErr.message);
      }

      req.apiKey = key;
      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Server error"
      });
    }
  };
}

module.exports = apiKeyMiddleware;