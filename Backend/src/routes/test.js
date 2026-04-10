const express = require("express");
const router = express.Router();
const db = require("../config/firebase");

const { createShipment, getAllShipments, getShipmentById } = require("../services/firestoreService");


router.get("/write", async (req, res) => {
  try {
    const docRef = await createShipment("New York", "Los Angeles", "High");

    res.json({ message: "Document written", id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get("/read", async (req, res) => {
  try {
    const snapshot = await getAllShipments();

    res.json(snapshot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;