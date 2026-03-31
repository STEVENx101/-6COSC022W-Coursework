const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Bid = sequelize.define("Bid", {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bid_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  bid_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM("PENDING", "WON", "LOST"),
    defaultValue: "PENDING"
  }
}, {
  tableName: "bids",
  timestamps: false
});

module.exports = Bid;