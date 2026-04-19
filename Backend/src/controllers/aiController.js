const db = require("../config/firebase");
const { generateAIResponse } = require("../services/aiServices");

exports.queryAI = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const snapshot = await db.collection("shipments").get();

    const shipments = snapshot.docs.map(doc => ({
      shipmentId: doc.id,
      ...doc.data()
    }));

    let answer;

    try {
      answer = await generateAIResponse(query, shipments);
    } catch (err) {
      console.error("AI failed:", err.message);

      
      const highRisk = shipments.filter(s => s.riskLevel === "High").length;

      answer = `AI service unavailable. ${highRisk} shipments are currently high risk.`;
    }

    res.status(200).json({ answer });

  } catch (err) {
    console.error("Controller error:", err);
    res.status(500).json({ error: err.message });
  }
};