const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PasswordResetToken = sequelize.define("PasswordResetToken", {
  token: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expires: {
    type: DataTypes.BIGINT,
    allowNull: false
  }
}, {
  tableName: "password_reset_tokens",
  timestamps: false
});

module.exports = PasswordResetToken;