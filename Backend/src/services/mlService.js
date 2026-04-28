require("dotenv").config();

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";
const ML_HEALTH_URL = `${ML_SERVICE_URL}/health`;
const ML_PREDICT_URL = `${ML_SERVICE_URL}/predict`;
const ML_REQUEST_TIMEOUT_MS = Number(process.env.ML_REQUEST_TIMEOUT_MS) || 25000;
const ML_WAKE_RETRIES = Number(process.env.ML_WAKE_RETRIES) || 3;
const ML_RETRY_DELAY_MS = Number(process.env.ML_RETRY_DELAY_MS) || 4000;
const ML_POST_WAKE_DELAY_MS = Number(process.env.ML_POST_WAKE_DELAY_MS) || 2500;

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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, options = {}, timeoutMs = ML_REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function wakeMlService() {
  for (let attempt = 1; attempt <= ML_WAKE_RETRIES; attempt += 1) {
    try {
      const response = await fetchWithTimeout(
        ML_HEALTH_URL,
        {
          method: "GET",
        },
        ML_REQUEST_TIMEOUT_MS
      );
      const payload = await response.json().catch(() => ({}));

      if (response.ok && payload.modelLoaded) {
        return;
      }
    } catch (error) {
      if (attempt === ML_WAKE_RETRIES) {
        throw error;
      }
    }

    if (attempt < ML_WAKE_RETRIES) {
      await sleep(ML_RETRY_DELAY_MS);
    }
  }
}

async function requestPrediction(features) {
  return fetchWithTimeout(
    ML_PREDICT_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(features),
    },
    ML_REQUEST_TIMEOUT_MS
  );
}

function normalizePrediction(payload, features) {
  return {
    delayProbability: Number(payload.delayProbability) || 0,
    riskLevel: payload.riskLevel || getRiskLevel(payload.delayProbability),
    explanation: payload.explanation || "",
    modelVersion: payload.modelVersion || "xgboost-regressor-v1",
    features: payload.features || features,
  };
}

async function predictShipmentDelay(features) {
  for (let attempt = 1; attempt <= ML_WAKE_RETRIES; attempt += 1) {
    try {
      const response = await requestPrediction(features);
      const payload = await response.json().catch(() => ({}));

      if (response.ok) {
        return normalizePrediction(payload, features);
      }

      const message =
        payload.error || payload.message || "ML service prediction failed";
      const shouldRetry =
        response.status === 503 ||
        (response.status >= 500 && response.status < 600);

      if (!shouldRetry || attempt === ML_WAKE_RETRIES) {
        throw new Error(message);
      }

      await wakeMlService();
      await sleep(ML_POST_WAKE_DELAY_MS);
    } catch (error) {
      if (attempt === ML_WAKE_RETRIES) {
        throw new Error(
          error?.message ||
            `Could not reach ML service at ${ML_SERVICE_URL}. It may still be waking from Render sleep.`
        );
      }

      await wakeMlService();
      await sleep(ML_POST_WAKE_DELAY_MS);
    }
  }

  throw new Error(
    `Could not reach ML service at ${ML_SERVICE_URL}. It may still be waking from Render sleep.`
  );
}

module.exports = {
  predictShipmentDelay,
};
