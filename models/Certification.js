const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Certification = sequelize.define("Certification", {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  organization: {
    type: DataTypes.STRING,
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: "certifications",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

module.exports = Certification;