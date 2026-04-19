require("dotenv").config();
const express = require("express");
const cors = require("cors");

const testRoutes = require("./routes/test");
const shipmentRoutes = require("./routes/shipments");
const aiRoutes = require("./routes/ai");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", shipmentRoutes);
app.use("/test", testRoutes);

app.use("/api/v1/ai", aiRoutes);

module.exports = app;