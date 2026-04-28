import { BASE_URL } from "./base";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestPrediction(payload, options = {}) {
  return fetch(`${BASE_URL}/api/v1/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: options.signal,
  });
}

export async function predictShipmentRisk(
  payload,
  { attempt = 1, signal } = {}
) {
  let res;

  try {
    res = await requestPrediction(payload, { signal });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw error;
    }

    throw new Error(
      "Could not reach backend prediction API. Ensure backend is running."
    );
  }

  const text = await res.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!res.ok) {
    if ((res.status === 503 || data.retryable) && attempt < 2) {
      await wait(6000);
      return predictShipmentRisk(payload, { attempt: attempt + 1, signal });
    }

    throw new Error(
      data.error ||
        text ||
        `Prediction request failed with status ${res.status}`
    );
  }

  return data;
}
