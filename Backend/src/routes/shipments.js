const express = require("express");
const router = express.Router();
const { createShipment, getAllShipments, getShipmentById, updateShipmentStatus } = require ("../controllers/shipmentController");

router.post("/api/v1/shipments", createShipment);
router.get("/api/v1/shipments", getAllShipments);
router.get("/api/v1/shipments/:id", getShipmentById);
router.put("/api/v1/shipments/:id", updateShipmentStatus);

module.exports = router;