require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const swaggerUi = require("swagger-ui-express");


const { sequelize } = require("./models");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const bidRoutes = require("./routes/bidRoutes");
const { apiLimiter } = require("./middleware/rateLimiter");
const swaggerSpec = require("./config/swagger");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

app.use("/api", apiLimiter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/bids", bidRoutes);



app.get("/health", (req, res) => {
  res.json({ message: "Server is running" });
});

sequelize.authenticate()
  .then(() => console.log("Database connected"))
  .then(() => sequelize.sync({ alter: true }))
  .then(() => console.log("Models synced"))
  .catch((err) => console.error("DB error:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});