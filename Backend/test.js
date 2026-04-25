const { calculateEventImpact } = require("./src/services/eventImpactService");

const origin = { lat: 18.9388, lng: 72.8258 };
const destination = { lat: 18.9388, lng: 72.8258 };

const eta = new Date("2026-04-23T19:00:00");

const result = calculateEventImpact(origin, destination, eta);

console.log(result);