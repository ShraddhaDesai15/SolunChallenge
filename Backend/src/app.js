require("dotenv").config();
const express = require("express");
const cors = require("cors");

const testRoutes = require("./routes/test");
const shipmentRoutes = require("./routes/shipments");
const aiRoutes = require("./routes/ai");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(express.json());

app.use("/", shipmentRoutes);
app.use("/test", testRoutes);

app.use("/api/v1/ai", aiRoutes);

module.exports = app;
