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
const ApiKeyLog = require("./ApiKeyLog");

// ─── Associations ──────────────────────────────────────────────────

// User → Profile (one-to-one)
User.hasOne(Profile, {foreignKey: "user_id", onDelete: "CASCADE"});
Profile.belongsTo(User, {foreignKey: "user_id"});

// User → VerificationToken (one-to-many)
User.hasMany(VerificationToken, {foreignKey: "user_id", onDelete: "CASCADE"});
VerificationToken.belongsTo(User, {foreignKey: "user_id"});

// User → PasswordResetToken (one-to-many)
User.hasMany(PasswordResetToken, {foreignKey: "user_id", onDelete: "CASCADE"});
PasswordResetToken.belongsTo(User, {foreignKey: "user_id"});

// User → Bid (one-to-many)
User.hasMany(Bid, {foreignKey: "user_id", onDelete: "CASCADE"});
Bid.belongsTo(User, {foreignKey: "user_id"});

// User → Degree (one-to-many)
User.hasMany(Degree, {foreignKey: "user_id", onDelete: "CASCADE"});
Degree.belongsTo(User, {foreignKey: "user_id"});

// User → Certification (one-to-many)
User.hasMany(Certification, {foreignKey: "user_id", onDelete: "CASCADE"});
Certification.belongsTo(User, {foreignKey: "user_id"});

// User → Licence (one-to-many)
User.hasMany(Licence, {foreignKey: "user_id", onDelete: "CASCADE"});
Licence.belongsTo(User, {foreignKey: "user_id"});

// User → Course (one-to-many)
User.hasMany(Course, {foreignKey: "user_id", onDelete: "CASCADE"});
Course.belongsTo(User, {foreignKey: "user_id"});

// User → EmploymentHistory (one-to-many)
User.hasMany(EmploymentHistory, {foreignKey: "user_id", onDelete: "CASCADE"});
EmploymentHistory.belongsTo(User, {foreignKey: "user_id"});

// User → InfluencerDay (one-to-many)
User.hasMany(InfluencerDay, { foreignKey: "user_id", onDelete: "CASCADE" });
InfluencerDay.belongsTo(User, { foreignKey: "user_id" });

// User → ApiKey (one-to-many)
User.hasMany(ApiKey, { foreignKey: "user_id", onDelete: "CASCADE" });
ApiKey.belongsTo(User, { foreignKey: "user_id" });

// ApiKey → ApiKeyLog (one-to-many) — tracks every usage of each key
ApiKey.hasMany(ApiKeyLog, { foreignKey: "api_key_id", onDelete: "CASCADE" });
ApiKeyLog.belongsTo(ApiKey, { foreignKey: "api_key_id" });

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
    BlacklistedToken,
    ApiKeyLog
};