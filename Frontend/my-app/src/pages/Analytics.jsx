import { useShipments } from "../hooks/useShipments";
import Navbar from "../components/Navbar";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Analytics() {
  // 1. Always call the hook at the very top. 
  // If useShipments uses a websocket or Firebase, this 'data' variable 
  // will update automatically when the server sends changes.
  const data = useShipments();

  // 2. Define your fallback (dummy) data
  const dummyData = [
    { id: 1, riskLevel: "High", status: "delayed" },
    { id: 2, riskLevel: "Medium", status: "in_transit" },
    { id: 3, riskLevel: "Low", status: "delivered" },
    { id: 4, riskLevel: "High", status: "in_transit" },
  ];

  // 3. Determine which source to use. 
  // If 'data' exists and has items, use it. Otherwise, use dummyData.
  const shipments = (data && data.length > 0) ? data : dummyData;

  // 🔥 Risk Data (Calculated dynamically based on the 'shipments' variable)
  const riskData = [
    { name: "High", value: shipments.filter(s => s.riskLevel === "High").length },
    { name: "Medium", value: shipments.filter(s => s.riskLevel === "Medium").length },
    { name: "Low", value: shipments.filter(s => s.riskLevel === "Low").length },
  ];

  // 🔥 Status Data (Calculated dynamically)
  const statusData = [
    { name: "In Transit", value: shipments.filter(s => s.status === "in_transit").length },
    { name: "Delayed", value: shipments.filter(s => s.status === "delayed").length },
    { name: "Delivered", value: shipments.filter(s => s.status === "delivered").length },
  ];

  const COLORS = ["#ef4444", "#facc15", "#22c55e"];

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">📊 Analytics Dashboard</h1>
          {data && data.length > 0 && (
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              ● Live Data
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* RISK PIE CHART */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="mb-4 font-semibold text-gray-700">Risk Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={riskData} dataKey="value" outerRadius={100} label>
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* STATUS BAR CHART */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="mb-4 font-semibold text-gray-700">Shipment Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}