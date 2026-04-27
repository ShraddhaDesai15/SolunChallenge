const QA_LIBRARY = [
  {
    questions: [
      "which shipments are most at risk today",
      "high risk shipments",
      "risky shipments"
    ],
    answer:
      "Shipments with high delay probability, heavy traffic, or nearby disruptive events such as rallies or festivals are considered high risk."
  },
  {
    questions: [
      "why are shipments delayed",
      "why delay",
      "reason for delay"
    ],
    answer:
      "Delays are typically caused by traffic congestion, weather conditions, or external events such as rallies and festivals."
  },
  {
    questions: [
      "which routes should i avoid",
      "avoid routes",
      "bad routes"
    ],
    answer:
      "Routes passing through high-traffic areas or near major events should be avoided. Alternative routes are recommended."
  },
  {
    questions: [
      "how do events affect deliveries",
      "event impact",
      "rally impact"
    ],
    answer:
      "Events like political rallies, festivals, and cricket matches can increase congestion and significantly delay shipments."
  },
  {
    questions: [
      "how to optimize delivery",
      "improve delivery time",
      "reduce delay"
    ],
    answer:
      "You can optimize deliveries by avoiding peak hours, using alternate routes, and accounting for external disruptions."
  },
  {
    questions: [
      "is weather affecting shipments",
      "weather impact"
    ],
    answer:
      "Weather conditions such as rain, haze, or storms can increase delay probability and affect delivery reliability."
  }
];

const DEFAULT_RESPONSE =
  "Based on logistics data, shipment performance is influenced by traffic, weather, and external events. Monitoring these factors helps reduce delays.";

function normalize(text) {
  return text.toLowerCase().trim();
}

function getFallbackResponse(question) {
  const q = normalize(question);

  for (const item of QA_LIBRARY) {
    for (const pattern of item.questions) {
      if (q.includes(pattern)) {
        return item.answer;
      }
    }
  }

  return DEFAULT_RESPONSE;
}

module.exports = { getFallbackResponse };