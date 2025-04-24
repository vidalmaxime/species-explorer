import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Observation } from "../types/inaturalist";
import { getPhotoUrl } from "../utils/api";

// This is a separate component to fix map bounds after the map is created
function MapBoundsUpdater({ observations }: { observations: Observation[] }) {
  const map = useMap();

  useEffect(() => {
    if (observations.length > 0) {
      try {
        const validObservations = observations.filter(
          (obs) =>
            Array.isArray(obs.location) &&
            obs.location.length === 2 &&
            typeof obs.location[0] === "number" &&
            typeof obs.location[1] === "number" &&
            !isNaN(obs.location[0]) &&
            !isNaN(obs.location[1]) &&
            Math.abs(obs.location[0]) <= 90 &&
            Math.abs(obs.location[1]) <= 180
        );

        if (validObservations.length > 0) {
          const latlngs = validObservations.map((obs) =>
            L.latLng(obs.location[0], obs.location[1])
          );
          const bounds = L.latLngBounds(latlngs);
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      } catch (error) {
        console.error("Error setting map bounds:", error);
      }
    }
  }, [map, observations]);

  return null;
}

interface MapProps {
  observations: Observation[];
}

const Map = ({ observations }: MapProps) => {
  // Fix for Leaflet marker icon in Next.js
  useEffect(() => {
    // Use unknown as intermediate type for safe casting
    const iconDefault = L.Icon.Default.prototype as unknown;
    const iconDefaultAny = iconDefault as { _getIconUrl?: unknown };
    delete iconDefaultAny._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    });
  }, []);

  const defaultCenter: [number, number] = [20, 0]; // Default center (middle of the map)
  const defaultZoom = 2;

  // Filter out observations with invalid coordinates
  const validObservations = observations.filter(
    (obs) =>
      Array.isArray(obs.location) &&
      obs.location.length === 2 &&
      typeof obs.location[0] === "number" &&
      typeof obs.location[1] === "number" &&
      !isNaN(obs.location[0]) &&
      !isNaN(obs.location[1]) &&
      Math.abs(obs.location[0]) <= 90 &&
      Math.abs(obs.location[1]) <= 180
  );

  console.log(
    `Total observations: ${observations.length}, Valid observations: ${validObservations.length}`
  );
  if (validObservations.length > 0) {
    console.log(
      "Sample valid observation location:",
      validObservations[0].location
    );
  }

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapBoundsUpdater observations={validObservations} />

      {validObservations.map((observation) => (
        <Marker
          key={observation.id}
          position={[observation.location[0], observation.location[1]]}
        >
          <Popup>
            <div className="max-w-xs">
              <h3 className="font-bold text-lg text-blue-800">
                {observation.species_guess}
              </h3>
              <p className="text-sm font-medium text-gray-700 mt-1">
                Observed on:{" "}
                {new Date(observation.observed_on).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-700">
                By: {observation.user.name || observation.user.login}
              </p>
              {getPhotoUrl(observation) && (
                <img
                  src={getPhotoUrl(observation)}
                  alt={observation.species_guess}
                  className="w-full h-32 object-cover mt-3 rounded-md shadow-sm"
                />
              )}
              <a
                href={observation.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-3 text-blue-600 hover:underline text-sm font-medium bg-blue-50 p-2 rounded-md text-center"
              >
                View on iNaturalist
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
