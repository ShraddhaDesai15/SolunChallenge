import { useState, useEffect } from "react";
import { getShipments } from "../api/shipments";

export function useShipments() {
  const [shipments, setShipments] = useState([]);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    let isMounted = true;

    const loadShipments = async () => {
      try {
        const data = await getShipments();

        if (isMounted) {
          setShipments(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setShipments([]);
        }
      }
    };

    loadShipments();
    const intervalId = setInterval(loadShipments, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  if (error) {
    console.error("Shipment loading error:", error);
  }

  return shipments;
}
