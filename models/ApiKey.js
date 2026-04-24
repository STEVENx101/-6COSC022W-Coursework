const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// ApiKey model – stores API keys with scoped permissions per client application.
// Permissions are stored as a JSON array (e.g. ["read:alumni", "read:analytics"])
// so the middleware can enforce granular access control on every request.
const ApiKey = sequelize.define("ApiKey", {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  api_key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  client_name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Default Client",
    comment: "Name of the client application (e.g. Analytics Dashboard, Mobile AR App)"
  },
  permissions: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: ["read:alumni"],
    comment: "Scoped permissions array e.g. [\"read:alumni\", \"read:analytics\", \"read:alumni_of_day\"]"
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  usage_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  last_used_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: "Timestamp of the last API call made with this key"
  },
  revoked_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: "api_keys",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

module.exports = ApiKey;