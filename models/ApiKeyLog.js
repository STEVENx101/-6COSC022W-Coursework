const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// ApiKeyLog model – records every API key usage for auditing and usage statistics.
// Each row captures which key was used, the endpoint accessed, HTTP method,
// IP address, and timestamp. This supports the CW2 requirement to
// "View usage statistics i.e. number of times and timestamps of clients
// logging in and usage of keys / tokens and endpoints accessed."
const ApiKeyLog = sequelize.define("ApiKeyLog", {
  api_key_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "Foreign key referencing the api_keys table"
  },
  endpoint: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: "The API endpoint that was accessed e.g. /api/analytics/overview"
  },
  method: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: "HTTP method (GET, POST, PUT, DELETE)"
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: "Client IP address (supports IPv6 length)"
  },
  response_status: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: "HTTP response status code"
  }
}, {
  tableName: "api_key_logs",
  timestamps: true,
  createdAt: "accessed_at",
  updatedAt: false
});

module.exports = ApiKeyLog;
