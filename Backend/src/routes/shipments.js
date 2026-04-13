const express = require("express");
const router = express.Router();
const { createShipment, getAllShipments, getShipmentById, updateShipmentStatus, predictRisk } = require ("../controllers/shipmentController");
const {validate_shipment, validate_prediction} = require("../middleware/validate");

router.post("/api/v1/shipments",validate_shipment, createShipment);
router.post("/api/v1/predict", validate_prediction, predictRisk);
router.get("/api/v1/shipments", getAllShipments);
router.get("/api/v1/shipments/:id", getShipmentById);
router.put("/api/v1/shipments/:id/status", updateShipmentStatus);

module.exports = router;
