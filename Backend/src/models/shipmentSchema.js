
const shipmentSchema = {
  shipmentId: "string", 

  status: "pending | in_transit | delivered | cancelled",

  priority: "high | medium | low",

  origin: {
    lat: "number",
    lng: "number",
    address: "string (optional)"
  },

  destination: {
    lat: "number",
    lng: "number",
    address: "string (optional)"
  },

  distanceKm: "number (from Maps API)",
  trafficDurationMin: "number",
  trafficLevel: "Low | Moderate | Heavy",

  eta: "timestamp",

  weatherCondition: "string",
  weatherSeverity: "number (0-10)",

  delayProbability: "number (0-100)",
  riskLevel: "Low | Medium | High",

  routePolyline: "string",

  alternateRoutes: [
    {
      polyline: "string",
      durationMin: "number",
      summary: "string"
    }
  ],

  cascadeAffected: ["shipmentId"],

  aiExplanation: "string",

  createdAt: "timestamp",
  updatedAt: "timestamp"
};

module.exports = shipmentSchema;