import { useCallback, useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from "chart.js";

import Navbar from "../components/Navbar";
import SimulationPanel from "../components/SimulationPanel";
import { predictShipmentRisk } from "../api/simulation";
import {
  buildModelPayload,
  DISRUPTION_IMPACT,
  ROUTE_DELAY,
  WEATHER,
} from "../utils/simulationModel";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const Badge = ({ level }) => {
  const colors = {
    Low: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    High: "bg-red-100 text-red-800",
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded ${colors[level] || colors.Medium}`}>
      {level}
    </span>
  );
};

const Card = ({ title, value, extra }) => (
  <div className="bg-gray-50 p-4 rounded-xl">
    <p className="text-xs text-gray-400">{title}</p>
    <p className="text-xl font-semibold text-gray-800">{value}</p>
    {extra && <div className="mt-1">{extra}</div>}
  </div>
);

function buildResult({ params, disruptions, prediction }) {
  const probability = prediction.delayProbability;
  const delay = Math.min(Math.round(probability), 95);
  const damage = Math.min(Math.round(probability * 0.45), 85);
  const cost = Math.max(
    1,
    Math.round((probability * (params.cargo ?? 25)) / 120)
  );

  const factors = [
    { label: "Weather", val: Math.min(100, WEATHER[params.weather] * 10) },
    { label: "Traffic", val: params.traffic },
    { label: "Fatigue", val: params.fatigue * 10 },
    { label: "Route", val: Math.min(100, ROUTE_DELAY[params.route] * 4) },
    { label: "Distance", val: Math.min(100, Math.round(params.distance / 12)) },
    {
      label: "Issues",
      val: Math.min(
        100,
        disruptions.reduce(
          (sum, disruption) => sum + (DISRUPTION_IMPACT[disruption] || 0) * 4,
          0
        )
      ),
    },
  ];

  const tips = [];

  if (params.weather !== "clear") {
    tips.push("Weather severity is materially affecting predicted delay.");
  }

  if (params.traffic > 70) {
    tips.push("Peak-hour traffic is pushing the model toward a higher risk band.");
  }

  if (params.fatigue > 6) {
    tips.push("Driver fatigue is being treated as extra historical delay pressure.");
  }

  if (disruptions.length > 0) {
    tips.push("Operational disruptions are increasing the simulated route duration.");
  }

  if (tips.length === 0) {
    tips.push("The model sees this route as relatively stable under current settings.");
  }

  return {
    level: prediction.riskLevel,
    score: probability,
    delay,
    damage,
    cost,
    factors,
    tips,
    explanation: prediction.explanation,
    modelVersion: prediction.modelVersion,
    features: prediction.features,
  };
}

export default function Simulation() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [scenario, setScenario] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  const handleScenarioChange = useCallback((nextScenario) => {
    setScenario(nextScenario);
  }, []);

  useEffect(() => {
    if (!scenario?.payload) {
      return;
    }

    let isCancelled = false;

    setPreviewLoading(true);
    setPreviewError("");

    const timeoutId = setTimeout(async () => {
      try {
        const prediction = await predictShipmentRisk(scenario.payload);

        if (!isCancelled) {
          setPreview(prediction);
        }
      } catch (err) {
        if (!isCancelled) {
          setPreview(null);
          setPreviewError(err.message || "Preview failed");
        }
      } finally {
        if (!isCancelled) {
          setPreviewLoading(false);
        }
      }
    }, 350);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [scenario]);

  const runSimulation = async (data) => {
    setLoading(true);
    setError("");

    try {
      const payload = data.payload || buildModelPayload(data);
      const prediction =
        !previewLoading &&
        !previewError &&
        preview &&
        JSON.stringify(preview.features) === JSON.stringify(payload)
          ? preview
          : await predictShipmentRisk(payload);
      const nextResult = buildResult({
        params: data.params,
        disruptions: data.disruptions,
        prediction,
      });
      const entry = {
        id: history.length + 1,
        score: prediction.delayProbability,
        level: prediction.riskLevel,
        time: new Date().toLocaleTimeString(),
      };

      setResult(nextResult);
      setHistory((prev) => [entry, ...prev.slice(0, 8)]);
    } catch (err) {
      setError(err.message || "Simulation failed");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const chartData = result && {
    labels: result.factors.map((factor) => factor.label),
    datasets: [
      {
        data: result.factors.map((factor) => factor.val),
        backgroundColor: "#4F46E5",
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Risk Simulation</h1>
        <p className="text-sm text-gray-400 mb-6">
          Try different scenarios and run them through the trained model
        </p>

        <div className="grid md:grid-cols-[280px_1fr] gap-6">
          <SimulationPanel
            onSimulate={runSimulation}
            onScenarioChange={handleScenarioChange}
            preview={preview}
            previewLoading={previewLoading}
            previewError={previewError}
          />

          <div className="bg-white p-6 rounded-xl shadow space-y-6">
            {!result && !loading && !error && (
              <p className="text-gray-400 text-sm text-center py-10">
                Run a simulation to see model results
              </p>
            )}

            {loading && (
              <p className="text-gray-400 text-sm text-center py-10">
                Running simulation...
              </p>
            )}

            {error && !loading && (
              <p className="text-red-500 text-sm text-center py-6">{error}</p>
            )}

            {result && !loading && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <Card
                    title="Delay risk"
                    value={`${result.delay}%`}
                    extra={<Badge level={result.level} />}
                  />
                  <Card
                    title="Damage risk"
                    value={`${result.damage}%`}
                    extra={<Badge level={result.level} />}
                  />
                  <Card
                    title="Extra cost"
                    value={`INR ${result.cost}K`}
                    extra={
                      <span className="text-xs text-gray-400">
                        Model score {result.score.toFixed(2)}
                      </span>
                    }
                  />
                </div>

                <div className="h-48">
                  <Bar data={chartData} options={chartOptions} />
                </div>

                <div className="bg-indigo-50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-indigo-900 mb-2">
                    Model explanation
                  </h4>
                  <p className="text-sm text-indigo-900">{result.explanation}</p>
                  <p className="text-xs text-indigo-700 mt-2">
                    Model: {result.modelVersion} | Features: distance{" "}
                    {result.features.distanceKm} km, traffic{" "}
                    {result.features.trafficDurationMin} min, weather severity{" "}
                    {result.features.weatherSeverity}, hour{" "}
                    {result.features.timeOfDay}, historical delay{" "}
                    {result.features.historicalDelayAvg}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">
                    Suggestions
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {result.tips.map((tip, index) => (
                      <li key={index}>- {tip}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">
                    Recent runs
                  </h4>
                  {history.map((entry) => (
                    <div key={entry.id} className="text-xs text-gray-500">
                      #{entry.id} - {entry.score.toFixed(2)}/100 - {entry.level} -{" "}
                      {entry.time}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
