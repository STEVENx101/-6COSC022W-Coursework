const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const InfluencerDay = sequelize.define("InfluencerDay", {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  active_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true
  },
  appearance_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: "influencer_day",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

module.exports = InfluencerDay;