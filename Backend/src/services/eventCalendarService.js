// backend/src/services/eventCalendarService.js

const { generateEventFeatures } = require("./eventSimulator");
const eventDataset = require("../data/eventDataset");

/**
 * Get events relevant to a shipment ETA
 */
function getRelevantEvents(eta, windowHours = 6) {
  const shipmentTime = new Date(eta);

  return eventDataset
    .filter(event => {
      const eventTime = new Date(event.startTime);

      const hoursDiff =
        Math.abs(eventTime - shipmentTime) / (1000 * 60 * 60);

      return hoursDiff <= windowHours;
    })
    .map(event => ({
      ...event,
      features: generateEventFeatures(event) // 🔥 ADD HERE
    }));
}

module.exports = {
  getRelevantEvents
};