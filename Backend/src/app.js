const express = require("express");
const cors = require("cors");

const testRoutes = require("./routes/test");
const shipmentRoutes = require("./routes/shipments");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", shipmentRoutes);
app.use("/test", testRoutes);

module.exports = app;