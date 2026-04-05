import React from "react";
import { GoogleMap, useJsApiLoader, Marker, Polyline } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

export default function ShipmentMap({ shipments }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  });

  if (!isLoaded) return <p className="p-4">Loading Map...</p>;

  const center = { lat: 20.5937, lng: 78.9629 };

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={5}>

      {/* 🔴 MARKERS */}
      {shipments?.map((s) => (
        <Marker
          key={s.id}
          position={{
            lat: s.origin?.lat || center.lat,
            lng: s.origin?.lng || center.lng,
          }}
          icon={{
            url:
              s.riskLevel === "High"
                ? "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                : s.riskLevel === "Medium"
                ? "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
                : "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
          }}
        />
      ))}

      {/* 🔥 ROUTES */}
      {shipments?.map((s) => {
        const origin = {
          lat: s.origin?.lat || center.lat,
          lng: s.origin?.lng || center.lng,
        };

        const destination = {
          lat: s.destination?.lat || center.lat,
          lng: s.destination?.lng || center.lng,
        };

        const mainRoute = [origin, destination];

        const altRoutes =
          s.riskLevel === "High"
            ? [
                [
                  origin,
                  {
                    lat: (origin.lat + destination.lat) / 2 + 2,
                    lng: (origin.lng + destination.lng) / 2 - 2,
                  },
                  destination,
                ],
                [
                  origin,
                  {
                    lat: (origin.lat + destination.lat) / 2 - 2,
                    lng: (origin.lng + destination.lng) / 2 + 2,
                  },
                  destination,
                ],
              ]
            : [];

        return (
          <React.Fragment key={s.id}>

            {/* 🔴 MAIN ROUTE */}
            <Polyline
              path={mainRoute}
              options={{
                strokeColor:
                  s.riskLevel === "High"
                    ? "#ef4444"
                    : s.riskLevel === "Medium"
                    ? "#facc15"
                    : "#22c55e",
                strokeOpacity: 0.9,
                strokeWeight: 4,
              }}
            />

            {/* 🔵 ALTERNATE ROUTES */}
            {altRoutes.map((route, i) => (
              <Polyline
                key={`alt-${s.id}-${i}`}
                path={route}
                options={{
                  strokeColor: "#3b82f6",
                  strokeOpacity: 0.6,
                  strokeWeight: 3,
                }}
              />
            ))}

          </React.Fragment>
        );
      })}

    </GoogleMap>
  );
}