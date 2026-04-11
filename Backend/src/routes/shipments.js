const express = require("express");
const router = express.Router();
const { createShipment, getAllShipments, getShipmentById, updateShipmentStatus } = require ("../controllers/shipmentController");
const {validate_shipment} = require("../middleware/validate");

router.post("/api/v1/shipments",validate_shipment, createShipment);
router.get("/api/v1/shipments",validate_shipment, getAllShipments);
router.get("/api/v1/shipments/:id", validate_shipment, getShipmentById);
router.put("/api/v1/shipments/:id", validate_shipment, updateShipmentStatus);

module.exports = router;