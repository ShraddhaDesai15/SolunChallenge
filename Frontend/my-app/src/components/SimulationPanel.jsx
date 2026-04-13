import React, { useEffect, useState } from "react";

import { buildModelPayload } from "../utils/simulationModel";

const weatherOptions = [
  { value: "clear", label: "Clear skies" },
  { value: "rain", label: "Heavy rain" },
  { value: "cyclone", label: "Cyclone warning" },
  { value: "fog", label: "Dense fog" },
];

const routeOptions = [
  { value: "highway", label: "Highway" },
  { value: "state", label: "State roads" },
  { value: "urban", label: "City / urban" },
];

const disruptionsList = [
  { key: "strike", label: "Port strike", impact: 12 },
  { key: "fuel", label: "Fuel shortage", impact: 8 },
  { key: "road", label: "Road closure", impact: 15 },
];

function ScoreBar({ preview, loading }) {
  const score = preview?.delayProbability ?? 0;
  const label = loading ? "Refreshing" : preview?.riskLevel || "Unknown";
  const colorMap = {
    Low: "bg-emerald-500",
    Medium: "bg-yellow-500",
    High: "bg-red-500",
  };
  const color = colorMap[preview?.riskLevel] || "bg-gray-300";

  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <div className="flex justify-between text-xs mb-1">
        <span>Risk level</span>
        <span className="font-semibold">{label}</span>
      </div>

      <div className="h-2 bg-gray-200 rounded">
        <div
          className={`h-2 rounded ${color}`}
          style={{ width: `${Math.max(4, score)}%` }}
        />
      </div>

      <p className="text-sm mt-2 font-medium">
        {loading ? "Loading..." : `${score.toFixed(2)}/100`}
      </p>
    </div>
  );
}

export default function SimulationPanel({
  onSimulate,
  onScenarioChange,
  preview,
  previewLoading,
  previewError,
}) {
  const [data, setData] = useState({
    weather: "clear",
    route: "highway",
    traffic: 40,
    fatigue: 3,
    distance: 600,
    cargo: 25,
  });

  const [issues, setIssues] = useState([]);

  const toggleIssue = (key) => {
    setIssues((prev) =>
      prev.includes(key)
        ? prev.filter((x) => x !== key)
        : [...prev, key]
    );
  };

  useEffect(() => {
    onScenarioChange({
      params: data,
      disruptions: issues,
      payload: buildModelPayload({ params: data, disruptions: issues }),
    });
  }, [data, issues, onScenarioChange]);

  return (
    <div className="bg-white p-5 rounded-xl shadow space-y-4">
      <h2 className="font-semibold text-gray-800">Simulation Controls</h2>

      {/* Weather */}
      <div>
        <label className="text-sm text-gray-500">Weather</label>
        <select
          value={data.weather}
          onChange={(e) =>
            setData({ ...data, weather: e.target.value })
          }
          className="w-full border p-2 rounded mt-1"
        >
          {weatherOptions.map((w) => (
            <option key={w.value} value={w.value}>
              {w.label}
            </option>
          ))}
        </select>
      </div>

      {/* Route */}
      <div>
        <label className="text-sm text-gray-500">Route</label>
        <select
          value={data.route}
          onChange={(e) =>
            setData({ ...data, route: e.target.value })
          }
          className="w-full border p-2 rounded mt-1"
        >
          {routeOptions.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sliders */}
      <div>
        <label className="text-sm">Traffic: {data.traffic}%</label>
        <input
          type="range"
          min="0"
          max="100"
          value={data.traffic}
          onChange={(e) =>
            setData({ ...data, traffic: Number(e.target.value) })
          }
          className="w-full"
        />
      </div>

      <div>
        <label className="text-sm">Driver fatigue: {data.fatigue}</label>
        <input
          type="range"
          min="0"
          max="10"
          value={data.fatigue}
          onChange={(e) =>
            setData({ ...data, fatigue: Number(e.target.value) })
          }
          className="w-full"
        />
      </div>

      <div>
        <label className="text-sm">Distance: {data.distance} km</label>
        <input
          type="range"
          min="50"
          max="2000"
          step="50"
          value={data.distance}
          onChange={(e) =>
            setData({ ...data, distance: Number(e.target.value) })
          }
          className="w-full"
        />
      </div>

      {/* Disruptions */}
      <div>
        <p className="text-sm text-gray-500 mb-1">Disruptions</p>
        {disruptionsList.map((d) => (
          <label key={d.key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={issues.includes(d.key)}
              onChange={() => toggleIssue(d.key)}
            />
            {d.label}
          </label>
        ))}
      </div>

      {/* Score */}
      <ScoreBar preview={preview} loading={previewLoading} />
      {previewError && (
        <p className="text-xs text-red-500">{previewError}</p>
      )}

      <button
        onClick={() =>
          onSimulate({
            params: data,
            disruptions: issues,
            payload: buildModelPayload({ params: data, disruptions: issues }),
          })
        }
        className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
      >
        Run Simulation
      </button>
    </div>
  );
}
