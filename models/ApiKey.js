const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

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
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  usage_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
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