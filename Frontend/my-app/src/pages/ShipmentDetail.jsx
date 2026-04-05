import { useParams } from "react-router-dom";
import { useShipments } from "../hooks/useShipments";
import Navbar from "../components/Navbar";
import RiskBadge from "../components/RiskBadge";
import ShipmentMap from "../components/ShipmentMap";

export default function ShipmentDetail() {
  const { id } = useParams();
  const shipments = useShipments();

  const shipment = shipments.find((s) => s.id === id);
  const affectedShipments = shipments.filter(
  (s) =>
    s.id !== shipment.id &&
    (s.origin?.address === shipment.origin?.address ||
      s.destination?.address === shipment.destination?.address)
);
  if (!shipment) return <p className="p-6">Loading...</p>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="p-6">

        <h1 className="text-2xl font-bold mb-4">
          Shipment {shipment.shipmentId}
        </h1>

        {/* 🗺️ MAP */}
        <div className="mb-6 bg-white p-2 rounded-xl shadow">
          <ShipmentMap shipments={[shipment]} />
        </div>

        {/* INFO */}
        <div className="grid grid-cols-2 gap-6 mb-6">

          <div className="bg-white p-4 rounded-xl shadow">
            <p><strong>Origin:</strong> {shipment.origin?.address}</p>
            <p><strong>Destination:</strong> {shipment.destination?.address}</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <p><strong>Status:</strong> {shipment.status}</p>
            <p>
              <strong>Risk:</strong> <RiskBadge level={shipment.riskLevel} />
            </p>
          </div>

        </div>

        {/* AI */}
        <div className="bg-white p-4 rounded-xl shadow mb-4">
          <p><strong>Delay Probability:</strong> {shipment.delayProbability}%</p>
          <p><strong>AI Insight:</strong> {shipment.aiExplanation}</p>
        </div>

        {/* 🔥 HIGH RISK */}
       {shipment.riskLevel === "High" && affectedShipments.length > 0 && (
  <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-xl mt-6">
    <h2 className="font-semibold text-yellow-700 mb-2">
      ⚠ Cascade Impact
    </h2>

    <p className="text-sm text-gray-600 mb-2">
      This shipment may affect the following:
    </p>

    <ul className="space-y-2">
      {affectedShipments.map((s) => (
        <li
          key={s.id}
          className="cursor-pointer text-blue-600 hover:underline"
          onClick={() => window.location.href = `/shipment/${s.id}`}
        >
          🚚 {s.shipmentId} ({s.status})
        </li>
      ))}
    </ul>
  </div>
)}

      </div>
    </div>
  );
}