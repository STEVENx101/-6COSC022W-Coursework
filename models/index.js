const sequelize = require("../config/database");
const User = require("./User");
const Profile = require("./Profile");
const VerificationToken = require("./VerificationToken");
const PasswordResetToken = require("./PasswordResetToken");
const Bid = require("./Bid");
const Degree = require("./Degree");
const Certification = require("./Certification");
const Licence = require("./Licence");
const Course = require("./Course");
const EmploymentHistory = require("./EmploymentHistory");
const InfluencerDay = require("./InfluencerDay");
const ApiKey = require("./ApiKey");
const BlacklistedToken = require("./BlacklistedToken");

// Associations
User.hasOne(Profile, {foreignKey: "user_id", onDelete: "CASCADE"});
Profile.belongsTo(User, {foreignKey: "user_id"});

User.hasMany(VerificationToken, {foreignKey: "user_id", onDelete: "CASCADE"});
VerificationToken.belongsTo(User, {foreignKey: "user_id"});

User.hasMany(PasswordResetToken, {foreignKey: "user_id", onDelete: "CASCADE"});
PasswordResetToken.belongsTo(User, {foreignKey: "user_id"});

User.hasMany(Bid, {foreignKey: "user_id", onDelete: "CASCADE"});
Bid.belongsTo(User, {foreignKey: "user_id"});


User.hasMany(Degree, {foreignKey: "user_id", onDelete: "CASCADE"});
Degree.belongsTo(User, {foreignKey: "user_id"});

User.hasMany(Certification, {foreignKey: "user_id", onDelete: "CASCADE"});
Certification.belongsTo(User, {foreignKey: "user_id"});

User.hasMany(Licence, {foreignKey: "user_id", onDelete: "CASCADE"});
Licence.belongsTo(User, {foreignKey: "user_id"});

User.hasMany(Course, {foreignKey: "user_id", onDelete: "CASCADE"});
Course.belongsTo(User, {foreignKey: "user_id"});

User.hasMany(EmploymentHistory, {foreignKey: "user_id", onDelete: "CASCADE"});
EmploymentHistory.belongsTo(User, {foreignKey: "user_id"});

User.hasMany(InfluencerDay, { foreignKey: "user_id", onDelete: "CASCADE" });
InfluencerDay.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(ApiKey, { foreignKey: "user_id", onDelete: "CASCADE" });
ApiKey.belongsTo(User, { foreignKey: "user_id" });

module.exports = {
    sequelize,
    User,
    Profile,
    VerificationToken,
    PasswordResetToken,
    Bid,
    Degree,
    Certification,
    Licence,
    Course,
    EmploymentHistory,
    InfluencerDay,
    ApiKey,
    BlacklistedToken
};