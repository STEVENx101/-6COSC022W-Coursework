const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Course = sequelize.define("Course", {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  course_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  provider: {
    type: DataTypes.STRING,
    allowNull: true
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  sponsorship_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  is_sponsored: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: "courses",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

module.exports = Course;