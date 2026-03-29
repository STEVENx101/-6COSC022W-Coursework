const sequelize = require("../config/database");
const User = require("./User");
const Profile = require("./Profile");
const VerificationToken = require("./VerificationToken");
const PasswordResetToken = require("./PasswordResetToken");

// Associations
User.hasOne(Profile, { foreignKey: "user_id", onDelete: "CASCADE" });
Profile.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(VerificationToken, { foreignKey: "user_id", onDelete: "CASCADE" });
VerificationToken.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(PasswordResetToken, { foreignKey: "user_id", onDelete: "CASCADE" });
PasswordResetToken.belongsTo(User, { foreignKey: "user_id" });

module.exports = {
  sequelize,
  User,
  Profile,
  VerificationToken,
  PasswordResetToken
};