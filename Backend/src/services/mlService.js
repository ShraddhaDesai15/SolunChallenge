require("dotenv").config();

const ML_SERVICE_URL = "http://127.0.0.1:8000";

function getRiskLevel(delayProbability) {
  const probability = Number(delayProbability) || 0;

  if (probability < 30) {
    return "Low";
  }

  if (probability < 70) {
    return "Medium";
  }

  return "High";
}

async function predictShipmentDelay(features) {
  let response;

  try {
    response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(features),
    });
  } catch (error) {
    throw new Error(
      `Could not reach ML service at ${ML_SERVICE_URL}. Start Backend/ml_service/app.py first.`
    );
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      payload.error || payload.message || "ML service prediction failed";
    throw new Error(message);
  }

  return {
    delayProbability: Number(payload.delayProbability) || 0,
    riskLevel: payload.riskLevel || getRiskLevel(payload.delayProbability),
    explanation: payload.explanation || "",
    modelVersion: payload.modelVersion || "xgboost-regressor-v1",
    features: payload.features || features,
  };
}

module.exports = {
  predictShipmentDelay,
};
