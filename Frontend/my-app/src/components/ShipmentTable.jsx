import RiskBadge from "./RiskBadge";
import { useNavigate } from "react-router-dom";

export default function ShipmentTable({ shipments }) {
  const navigate = useNavigate();

  return (
    <table className="w-full bg-white shadow-sm rounded-xl overflow-hidden">

      {/* HEADER */}
      <thead>
        <tr className="bg-gray-50 border-b">
          <th className="p-3 text-left">ID</th>
          <th className="p-3 text-left">Origin</th>
          <th className="p-3 text-left">Destination</th>
          <th className="p-3 text-left">Status</th>
          <th className="p-3 text-left">Risk</th>
        </tr>
      </thead>

      {/* BODY */}
      <tbody>
        {shipments?.map((s) => (
          <tr
            key={s.id}
            className="border-b cursor-pointer hover:bg-gray-100 transition"
            onClick={() => navigate(`/shipment/${s.id}`)}
          >
            <td className="p-3">{s.shipmentId}</td>
            <td className="p-3">{s.origin?.address}</td>
            <td className="p-3">{s.destination?.address}</td>
            <td className="p-3 capitalize">{s.status}</td>
            <td className="p-3">
              <RiskBadge level={s.riskLevel} />
            </td>
          </tr>
        ))}
      </tbody>

    </table>
  );
}