import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ShipmentDetail from "./pages/ShipmentDetail";

import Analytics from "./pages/Analytics";
// Temporary pages
const Dummy = ({ title }) => (
  <div className="p-10 text-xl">{title} Page Coming Soon...</div>
);
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
      <Route path="/shipment/:id" element={<ShipmentDetail/>} />
      <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;