const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  role: {
    type: DataTypes.ENUM("user", "developer", "clients", "admin"),
    defaultValue: "user"
  },
  attended_event: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: "users",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

module.exports = User;