const { askGemini } = require("../services/geminiService");
const { getFallbackResponse } = require("../data/aiFallback");

exports.askAI = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question required" });
    }

    let answer;

    try {
      // 🔥 Try Gemini first
      answer = await askGemini(question);

      // If Gemini returns empty → fallback
      if (!answer || answer.trim().length < 5) {
        answer = getFallbackResponse(question);
      }

    } catch (err) {
      console.log("Gemini failed → using fallback");
      answer = getFallbackResponse(question);
    }

    res.json({ answer });

  } catch (err) {
    res.json({
      answer: getFallbackResponse(req.body.question || "")
    });
  }
};

module.exports = { askAI: exports.askAI };