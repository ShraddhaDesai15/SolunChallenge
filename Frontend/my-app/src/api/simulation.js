export async function predictShipmentRisk(payload) {
  let res;

  try {
    res = await fetch("/api/v1/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new Error(
      "Could not reach the backend prediction API. Make sure Frontend Vite is running and Backend `npm run dev` is fully started."
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
    throw new Error(
      data.error ||
        text ||
        `Prediction request failed with status ${res.status}`
    );
  }

  return data;
}
