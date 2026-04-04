const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Degree = sequelize.define("Degree", {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  degree_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  institution: {
    type: DataTypes.STRING,
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: "degrees",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

module.exports = Degree;