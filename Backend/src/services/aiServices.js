const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateAIResponse(query, shipments) {
  try {
    console.log("KEY:", process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const trimmed = shipments.slice(0, 20).map(s => ({
      shipmentId: s.shipmentId,
      riskLevel: s.riskLevel,
      delayProbability: s.delayProbability,
      origin: s.origin?.address,
      destination: s.destination?.address
    }));

    const prompt = `
You are a logistics AI assistant.

Here is shipment data:
${JSON.stringify(trimmed, null, 2)}

User question:
${query}

Answer clearly in 2-3 sentences. Be specific.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text();

  } catch (err) {
    console.error("Gemini error:", err.message);
    throw err;
  }
}

module.exports = {
  generateAIResponse
};