import { useState } from "react";
import Navbar from "../components/Navbar";
import SimulationPanel from "../components/SimulationPanel";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const WEATHER = { clear: 0, rain: 20, cyclone: 40, fog: 15 };
const ROUTE   = { highway: 0, state: 8, urban: 15 };

const Badge = ({ level }) => {
  const colors = { Low: "bg-green-100 text-green-800", Moderate: "bg-yellow-100 text-yellow-800", High: "bg-red-100 text-red-800", Critical: "bg-red-200 text-red-900" };
  return <span className={`text-xs px-2 py-0.5 rounded ${colors[level]}`}>{level}</span>;
};

const Card = ({ title, value, extra }) => (
  <div className="bg-gray-50 p-4 rounded-xl">
    <p className="text-xs text-gray-400">{title}</p>
    <p className="text-xl font-semibold text-gray-800">{value}</p>
    {extra && <div className="mt-1">{extra}</div>}
  </div>
);

function getResult({ params, disruptions, score }) {
  let level = "Low";
  if (score > 25) level = "Moderate";
  if (score > 50) level = "High";
  if (score > 75) level = "Critical";

  const delay  = Math.min(Math.round(score * 0.7), 90);
  const damage = Math.min(Math.round(score * 0.3), 80);
  const cost   = Math.round(score * (params.cargo ?? 25) * 0.003); // ✅ fixed: was params.cargoValue

  const factors = [
    { label: "Weather",  val: WEATHER[params.weather] },
    { label: "Traffic",  val: Math.round(params.traffic * 0.2) },
    { label: "Fatigue",  val: params.fatigue * 2 },
    { label: "Route",    val: ROUTE[params.route] },
    { label: "Distance", val: Math.round(params.distance / 250) * 2 },
    {
      label: "Issues",
      val: (disruptions.includes("strike") ? 10 : 0) // ✅ fixed: was disruptions.has()
         + (disruptions.includes("fuel")   ?  7 : 0)
         + (disruptions.includes("road")   ? 12 : 0),
    },
  ];

  const tips = [];
  if (params.weather !== "clear") tips.push("Weather may cause delays.");
  if (params.fatigue > 6)         tips.push("Driver should rest before trip.");
  if (params.traffic > 70)        tips.push("Avoid peak traffic hours.");
  if (disruptions.length > 0)     tips.push("Monitor disruptions closely."); // ✅ fixed: was disruptions.size
  if (tips.length === 0)          tips.push("All conditions look normal.");

  return { level, delay, damage, cost, factors, tips };
}

export default function Simulation() {
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const runSimulation = (data) => {
    setLoading(true);
    setTimeout(() => {
      const res   = getResult(data);
      const entry = { id: history.length + 1, score: data.score, level: res.level, time: new Date().toLocaleTimeString() };
      setResult({ ...res, score: data.score });
      setHistory((prev) => [entry, ...prev.slice(0, 8)]);
      setLoading(false);
    }, 800);
  };

  const chartData = result && {
    labels: result.factors.map((f) => f.label),
    datasets: [{ data: result.factors.map((f) => f.val), backgroundColor: "#4F46E5", borderRadius: 4 }],
  };

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }; // ✅ added

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Risk Simulation</h1>
        <p className="text-sm text-gray-400 mb-6">Try different scenarios and check how risk changes</p>

        <div className="grid md:grid-cols-[280px_1fr] gap-6">
          <SimulationPanel onSimulate={runSimulation} />

          <div className="bg-white p-6 rounded-xl shadow space-y-6">
            {!result && !loading && (
              <p className="text-gray-400 text-sm text-center py-10">Run a simulation to see results</p>
            )}
            {loading && (
              <p className="text-gray-400 text-sm text-center py-10">Running simulation...</p>
            )}

            {result && !loading && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <Card title="Delay risk"   value={`${result.delay}%`}  extra={<Badge level={result.level} />} />
                  <Card title="Damage risk"  value={`${result.damage}%`} extra={<Badge level={result.level} />} />
                  <Card title="Extra cost"   value={`₹${result.cost}K`}  extra={<span className="text-xs text-gray-400">Score {result.score}</span>} />
                </div>

                <div className="h-48">
                  <Bar data={chartData} options={chartOptions} />
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">Suggestions</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {result.tips.map((t, i) => <li key={i}>• {t}</li>)}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">Recent runs</h4>
                  {history.map((h) => (
                    <div key={h.id} className="text-xs text-gray-500">
                      #{h.id} — {h.score}/100 — {h.level} — {h.time}
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