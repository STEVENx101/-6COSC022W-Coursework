const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Licence = sequelize.define("Licence", {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  issuer: {
    type: DataTypes.STRING,
    allowNull: true
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: "licences",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

module.exports = Licence;