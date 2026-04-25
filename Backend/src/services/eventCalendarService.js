

const { generateEventFeatures } = require("./eventSimulator");
const eventDataset = require("../data/eventDataset");


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
      features: generateEventFeatures(event) 
    }));
}

module.exports = {
  getRelevantEvents
};