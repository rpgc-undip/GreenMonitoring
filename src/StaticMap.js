import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function FitBounds({ markers }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length === 0) return;

    const bounds = markers.map(({ lat, lng }) => [lat, lng]);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, markers]);

  return null;
}

export default function StaticMap({ markers = [] }) {
  if (markers.length === 0) return null;

  const center = [markers[0].lat, markers[0].lng];

  return (
    <div className="mt-8 h-[400px] w-full">
      <MapContainer center={center} zoom={17} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map(({ lat, lng, label }, index) => (
          <Marker key={index} position={[lat, lng]}>
            {label && (
              <Tooltip permanent direction="top" offset={[0, -10]}>
                {label}
              </Tooltip>
            )}
          </Marker>
        ))}
        <FitBounds markers={markers} />
      </MapContainer>
    </div>
  );
}
