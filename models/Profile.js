const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Profile = sequelize.define("Profile", {
  full_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  profile_image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  linkedin_url: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: "profiles",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

module.exports = Profile;