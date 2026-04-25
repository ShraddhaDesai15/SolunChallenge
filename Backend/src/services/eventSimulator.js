function generateEventFeatures(event) {

  const random = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  return {
    // =====================
    // 📍 LOCATION CONTEXT
    // =====================
    areaType: ["urban", "semi-urban", "highway"][random(0, 2)],
    populationDensity: random(1000, 20000),
    roadComplexity: random(1, 10),
    nearbyLandmarks: random(1, 5),

    // =====================
    // 🚗 TRAFFIC PATTERNS
    // =====================
    peakTrafficMultiplier: Math.random() * 2,
    expectedVehicleCount: random(500, 10000),
    congestionProbability: Math.random(),
    avgSpeedDropPercent: random(10, 80),

    // =====================
    // 🕒 TIME CONTEXT
    // =====================
    isPeakHour: Math.random() > 0.5,
    timeOfDay: random(0, 23),
    dayOfWeek: random(0, 6),

    // =====================
    // 🌦 WEATHER INTERACTION
    // =====================
    weatherSensitivity: Math.random(),
    rainImpactFactor: Math.random(),

    // =====================
    // 👥 CROWD BEHAVIOR
    // =====================
    expectedCrowdSize: random(1000, 50000),
    crowdVolatility: Math.random(),
    pedestrianImpact: Math.random(),

    // =====================
    // 🚨 EVENT CRITICALITY
    // =====================
    severityIndex: random(1, 10),
    policePresence: random(0, 5),
    roadClosureProbability: Math.random(),

    // =====================
    // 🔁 SYSTEM IMPACT
    // =====================
    reroutingDifficulty: Math.random(),
    cascadingImpactScore: random(1, 10),
    logisticsDisruptionIndex: Math.random(),

    // =====================
    // 📊 ADVANCED SIGNALS
    // =====================
    socialMediaBuzz: Math.random(),
    newsCoverageScore: Math.random(),
    historicalDisruptionScore: random(1, 10)
  };
}

module.exports = {
  generateEventFeatures
};