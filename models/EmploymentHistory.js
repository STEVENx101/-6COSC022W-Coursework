const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const EmploymentHistory = sequelize.define("EmploymentHistory", {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  company: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: "employment_history",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

module.exports = EmploymentHistory;