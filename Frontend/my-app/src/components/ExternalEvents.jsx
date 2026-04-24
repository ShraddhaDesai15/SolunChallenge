ExternalEvents.jsx


import { useState } from "react";

const IMPACT = {
  high:   { cls: "bg-red-100 text-red-700 border-red-200",    dot: "bg-red-500",    bar: "bg-red-400"    },
  medium: { cls: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-400", bar: "bg-yellow-400" },
  low:    { cls: "bg-green-100 text-green-700 border-green-200",  dot: "bg-green-500",  bar: "bg-green-400"  },
};

const ICONS = { cricket: "🏏", festival: "🎉", traffic: "🚦", weather: "🌧️", strike: "⚠️", default: "📍" };

function Tooltip({ text }) {
  return (
    <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-1 w-48 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
    </div>
  );
}

function EventCard({ event }) {
  const [tip, setTip] = useState(false);
  const meta = IMPACT[event.impact] ?? IMPACT.low;
  const icon = ICONS[event.type] ?? ICONS.default;

  return (
    <div className={`border rounded-xl p-4 space-y-2 transition hover:shadow-sm ${
      event.impact === "high" ? "border-red-200 bg-red-50/40" :
      event.impact === "medium" ? "border-yellow-200 bg-yellow-50/40" :
      "border-green-200 bg-green-50/30"}`}>

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">{event.name}</p>
            <p className="text-xs text-gray-400">{event.location} · {event.time}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${meta.cls}`}>
            {event.impact.charAt(0).toUpperCase() + event.impact.slice(1)}
          </span>
          {/* Info tooltip */}
          <div className="relative" onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)}>
            <button className="w-4 h-4 rounded-full border border-gray-300 text-gray-400 text-xs flex items-center justify-center hover:border-gray-400">
              i
            </button>
            {tip && <Tooltip text={event.reason ?? "External event affecting this route."} />}
          </div>
        </div>
      </div>

      {/* Delay + affected route */}
      <div className="flex items-center justify-between text-xs text-gray-600 bg-white/70 rounded-lg px-3 py-2 border border-gray-100">
        <span>Expected delay</span>
        <span className="font-semibold text-gray-800">+{event.delayMin} min</span>
      </div>

      {event.affectedRoute && (
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
          Route affected: <span className="font-medium text-gray-700 ml-1">{event.affectedRoute}</span>
        </p>
      )}
    </div>
  );
}

function AnalyticsBar({ label, count, max, color }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-20 text-gray-500 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${(count / max) * 100}%`, transition: "width .5s" }} />
      </div>
      <span className="text-xs font-medium text-gray-700 w-16">{count} shipment{count !== 1 ? "s" : ""}</span>
    </div>
  );
}

export default function ExternalEvents({ events = [] }) {
  const [filter, setFilter] = useState("all");

  if (!events.length) return null;

  // analytics: group by type
  const byType = events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + (e.shipmentsAffected ?? 1);
    return acc;
  }, {});
  const maxCount = Math.max(...Object.values(byType), 1);
  const typeColors = { cricket: "bg-blue-400", festival: "bg-purple-400", traffic: "bg-orange-400", weather: "bg-sky-400", strike: "bg-red-400" };

  const filtered = filter === "all" ? events : events.filter((e) => e.impact === filter);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800">Upcoming External Events</h3>
          <p className="text-xs text-gray-400 mt-0.5">Potential delays on your route — before they happen</p>
        </div>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
          {events.length} event{events.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5">
        {["all", "high", "medium", "low"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1 rounded-full border transition font-medium capitalize
              ${filter === f ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Event cards */}
      <div className="space-y-3">
        {filtered.length
          ? filtered.map((ev, i) => <EventCard key={i} event={ev} />)
          : <p className="text-xs text-gray-400 text-center py-4">No events for this filter.</p>}
      </div>

      {/* Analytics */}
      {Object.keys(byType).length > 0 && (
        <div className="border-t border-gray-100 pt-4 space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Impact distribution</p>
          {Object.entries(byType).map(([type, count]) => (
            <AnalyticsBar key={type} label={type.charAt(0).toUpperCase() + type.slice(1)}
              count={count} max={maxCount} color={typeColors[type] ?? "bg-gray-400"} />
          ))}
        </div>
      )}
    </div>
  );
}