const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "../src/data/eventDataset.js");

const cities = [
  { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
  { name: "Delhi", lat: 28.6139, lng: 77.2090 },
  { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
  { name: "Hyderabad", lat: 17.3850, lng: 78.4867 },
  { name: "Kolkata", lat: 22.5726, lng: 88.3639 }
];

const eventTypes = ["cricket", "festival", "rally"];

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateEvent(index) {
  const city = randomChoice(cities);
  const type = randomChoice(eventTypes);

  const baseLat = city.lat + random(-0.05, 0.05);
  const baseLng = city.lng + random(-0.05, 0.05);

  const start = new Date();
  start.setDate(start.getDate() + Math.floor(random(0, 7)));
  start.setHours(Math.floor(random(6, 22)));

  const end = new Date(start);
  end.setHours(start.getHours() + Math.floor(random(2, 6)));

  return {
    id: `EVT_AUTO_${index}`,
    type,
    name: `${type.toUpperCase()} Event ${index}`,

    venue: `${city.name} Central`,
    city: city.name,

    lat: Number(baseLat.toFixed(6)),
    lng: Number(baseLng.toFixed(6)),

    startTime: start.toISOString(),
    endTime: end.toISOString(),

    baseImpactScore: Math.floor(random(5, 10)),
    baseDelayMin: Math.floor(random(20, 80)),

    source: "simulated_engine"
  };
}

function generateDataset(count = 100) {
  const events = [];

  for (let i = 1; i <= count; i++) {
    events.push(generateEvent(i));
  }

  return events;
}


const dataset = generateDataset(150);

const fileContent = `module.exports = ${JSON.stringify(dataset, null, 2)};`;

fs.writeFileSync(outputPath, fileContent);

console.log(" Event dataset generated successfully!");