import "./RouteMap.css";
import { useEffect, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface RouteMapProps {
  startCoordinates: Coordinates;
  destinationCoordinates: Coordinates;
  startLocation: string;
  destination: string;
}

interface RouteResponse {
  code: string;
  routes?: {
    distance: number;
    duration: number;
    geometry: {
      coordinates: [number, number][];
    };
  }[];
}

// Map automatically adjusts to show the complete route
function MapUpdater({
  routeCoordinates,
}: {
  routeCoordinates: [number, number][];
}) {
  const map = useMap();

  useEffect(() => {
    if (routeCoordinates.length > 0) {
      const bounds = L.latLngBounds(routeCoordinates);

      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 12,
      });
    }
  }, [routeCoordinates, map]);

  return null;
}

// Main RouteMap component
export default function RouteMap({
  startCoordinates,
  destinationCoordinates,
  startLocation,
  destination,
}: RouteMapProps) {
  const [routeCoordinates, setRouteCoordinates] =
    useState<[number, number][]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const start: [number, number] = [
    startCoordinates.latitude,
    startCoordinates.longitude,
  ];

  const end: [number, number] = [
    destinationCoordinates.latitude,
    destinationCoordinates.longitude,
  ];

  useEffect(() => {
    let cancelled = false;

    async function loadRoute() {
      try {
        setLoading(true);
        setError("");

        const coordinates = `${start[1]},${start[0]};${end[1]},${end[0]}`;

        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
        );

        if (!response.ok) {
          throw new Error("Unable to load the driving route.");
        }

        const data: RouteResponse = await response.json();

        if (data.code !== "Ok" || !data.routes?.length) {
          throw new Error("No driving route was found.");
        }

        const route = data.routes[0];

        const points = route.geometry.coordinates.map(
          ([longitude, latitude]) =>
            [latitude, longitude] as [number, number]
        );

        if (!cancelled) {
          setRouteCoordinates(points);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load the route."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRoute();

    return () => {
      cancelled = true;
    };
  }, [
    startCoordinates.latitude,
    startCoordinates.longitude,
    destinationCoordinates.latitude,
    destinationCoordinates.longitude,
  ]);

  if (loading) {
    return (
      <div className="trip-map-message">
        Loading driving route...
      </div>
    );
  }

  if (error) {
    return (
      <div className="trip-map-message">
        {error}
      </div>
    );
  }

  return (
    <div className="trip-map-wrapper">
      <MapContainer
        center={start}
        zoom={8}
        scrollWheelZoom
        className="trip-map-container"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater routeCoordinates={routeCoordinates} />

        <Marker position={start}>
          <Popup>
            <strong>Starting Location</strong>
            <br />
            {startLocation}
          </Popup>
        </Marker>

        <Marker position={end}>
          <Popup>
            <strong>Destination</strong>
            <br />
            {destination}
          </Popup>
        </Marker>

        <Polyline
          positions={routeCoordinates}
          pathOptions={{
            color: "#c5a044",
            weight: 5,
            opacity: 0.9,
          }}
        />
      </MapContainer>
    </div>
  );
}