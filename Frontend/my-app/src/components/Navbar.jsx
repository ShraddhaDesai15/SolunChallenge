import { Link } from "react-router-dom";

export default function Navbar() {
  return (
   <div className="flex justify-between items-center px-6 py-4 bg-white shadow-sm border-b">
  <h1 className="text-xl font-bold text-emerald-600">
    Smart Supply Chains
  </h1>

  <div className="flex gap-6 text-gray-600">
    <Link to="/" className="hover:text-emerald-600">Dashboard</Link>
    <Link to="/create" className="hover:text-emerald-600">Create</Link>
    <Link to="/simulate" className="hover:text-emerald-600">Simulate</Link>
    <Link to="/analytics" className="hover:text-emerald-600">Analytics</Link>
  </div>
</div>
  );
}