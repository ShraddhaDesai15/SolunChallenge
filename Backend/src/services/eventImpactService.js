

const { getRelevantEvents } = require("./eventCalendarService");


function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function getImpactLabel(score) {
  if (score >= 7) return "High";
  if (score >= 4) return "Medium";
  return "Low";
}


function calculateEventImpact(origin, destination, eta) {
  const events = getRelevantEvents(eta); // next 48 hours

  let externalEvents = [];
  let totalImpactScore = 0;

  events.forEach(event => {
    const eventTime = new Date(event.startTime);
    const shipmentETA = new Date(eta);

    const hoursDiff = (eventTime - shipmentETA) / (1000 * 60 * 60);

    // ⏱️ TIME CONDITION (±4 hours)
    if (Math.abs(hoursDiff) <= 4) {

      // 📍 DISTANCE CONDITION
      const distFromOrigin = calculateDistance(
        origin.lat,
        origin.lng,
        event.lat,
        event.lng
      );

      const distFromDest = calculateDistance(
        destination.lat,
        destination.lng,
        event.lat,
        event.lng
      );

      if (distFromOrigin <= 10 || distFromDest <= 10) {


        let impactScore = event.baseImpactScore;
        let expectedDelayMin = event.baseDelayMin;

      
        if (event.type === "festival") {
        impactScore += 1;
        expectedDelayMin += 10;
        }

        if (event.type === "rally") {
        impactScore += 2;          
        expectedDelayMin += 15;
        }

        if (event.type === "cricket") {
        impactScore += 0;
        }

        if (event.features.populationDensity > 10000) {
        impactScore += 1;
        }

        if (event.features.roadClosureProbability > 0.6) {
        impactScore += 2;
        }

        if (event.features.crowdVolatility > 0.7) {
        impactScore += 1;
        }

        if (event.features.congestionProbability > 0.7) {
        impactScore += 1;
        }

        impactScore = Math.min(impactScore, 10);
         const impactLabel = getImpactLabel(impactScore);

        externalEvents.push({
          type: event.type,
          name: event.name,

          impact: impactLabel,             
          impactScore: impactScore,

          expectedDelayMin: expectedDelayMin, 
          time: event.startTime,             
          source: event.source
        });

        totalImpactScore += impactScore;
      }
    }
  });

  return {
    eventImpactScore: Math.min(totalImpactScore, 10),
    externalEvents
  };
}

module.exports = {
  calculateEventImpact
};