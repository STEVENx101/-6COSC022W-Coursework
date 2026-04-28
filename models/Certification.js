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
  tableName: "certifications",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

module.exports = Certification;