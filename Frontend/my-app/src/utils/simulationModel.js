export const WEATHER = { clear: 0, rain: 6, cyclone: 10, fog: 4 };
export const ROUTE_SPEED = { highway: 65, state: 48, urban: 30 };
export const ROUTE_DELAY = { highway: 0, state: 8, urban: 18 };
export const DISRUPTION_IMPACT = { strike: 8, fuel: 6, road: 12 };

export function buildModelPayload({ params, disruptions }) {
  const routeSpeed = ROUTE_SPEED[params.route] || 50;
  const baseDurationMin = (params.distance / routeSpeed) * 60;
  const disruptionMinutes = disruptions.reduce(
    (sum, disruption) => sum + (DISRUPTION_IMPACT[disruption] || 0),
    0
  );
  const trafficDurationMin =
    baseDurationMin * (1 + params.traffic / 100) +
    ROUTE_DELAY[params.route] +
    disruptionMinutes;
  const weatherSeverity = Math.min(
    10,
    WEATHER[params.weather] +
      (disruptions.includes("road") ? 1 : 0) +
      (params.fatigue >= 7 ? 1 : 0)
  );
  const timeOfDay =
    params.traffic >= 70 ? 18 : params.traffic >= 45 ? 9 : 13;
  const historicalDelayAvg = Math.min(
    40,
    params.fatigue * 2 + disruptionMinutes + (params.route === "urban" ? 6 : 0)
  );

  return {
    distanceKm: Number(params.distance),
    trafficDurationMin: Math.round(trafficDurationMin),
    weatherSeverity,
    timeOfDay,
    historicalDelayAvg: Math.round(historicalDelayAvg),
  };
}
