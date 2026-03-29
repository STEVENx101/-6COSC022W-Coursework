const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const VerificationToken = sequelize.define("VerificationToken", {
  token: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expires: {
    type: DataTypes.BIGINT,
    allowNull: false
  }
}, {
  tableName: "verification_tokens",
  timestamps: false
});

module.exports = VerificationToken;