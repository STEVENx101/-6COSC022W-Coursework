const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const BlacklistedToken = sequelize.define("BlacklistedToken", {
  token: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  expires_at: {
    type: DataTypes.BIGINT,
    allowNull: false
  }
}, {
  tableName: "blacklisted_tokens",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

module.exports = BlacklistedToken;