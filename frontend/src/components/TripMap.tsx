import "./TripMap.css"; 
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

// Component properties
interface Coordinates {
  latitude: number;
  longitude: number;
}

interface TripMapProps {
  itinerary?: string;

  mode?: "itinerary" | "route";

  startCoordinates?: Coordinates | null;
  destinationCoordinates?: Coordinates | null;

  startLocation?: string;
  destination?: string;
}

// Location information
interface MapLocation {
  name: string;
  lat: number;
  lon: number;
  day: number;
}

// Separate route information for each day
interface DayRoute {
  day: number;
  coordinates: [number, number][];
}

// Map location extraction response
interface ItineraryDay {
  day: number;
  locations: string[];
}

// Automatically adjust map zoom to show all locations
function MapUpdater({
  locations,
}: {
  locations: MapLocation[];
}) {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {

      const timer = setTimeout(() => {

        // Refresh Leaflet map dimensions
        map.invalidateSize();

        // Calculate boundaries using all locations
        const bounds = L.latLngBounds(
          locations.map((location) => [
            location.lat,
            location.lon,
          ])
        );

        // Automatically show all locations
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 12,
          animate: true,
        });

      }, 300);

      return () => clearTimeout(timer);
    }
  }, [locations, map]);

  return null;
}

// Main TripMap component
export default function TripMap({
  itinerary = "",
}: TripMapProps) {

  const [mapLocations, setMapLocations] =
    useState<MapLocation[]>([]);

  const [routes, setRoutes] =
    useState<DayRoute[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadMap() {
      try {
        setLoading(true);
        setError("");

        setMapLocations([]);
        setRoutes([]);

        const results: MapLocation[] = [];

        // STEP 1: Extract sightseeing locations using AI
        const extractionResponse = await fetch(
          "http://127.0.0.1:8000/api/maps/extract-locations",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              itinerary: itinerary,
            }),
          }
        );

        if (!extractionResponse.ok) {
          throw new Error(
            "Unable to extract sightseeing locations."
          );
        }

        const extractionData = await extractionResponse.json();

        const itineraryDays: ItineraryDay[] =
          extractionData.data.days;

        console.log(
          "AI EXTRACTED LOCATIONS:",
          itineraryDays
        );

        if (
          !Array.isArray(itineraryDays) ||
          itineraryDays.length === 0
        ) {
          throw new Error(
            "No sightseeing locations were found."
          );
        }

        // STEP 2: Find coordinates for each location
        for (const dayData of itineraryDays) {

          for (const name of dayData.locations) {

            const response = await fetch(
              `http://127.0.0.1:8000/api/maps/geocode?name=${encodeURIComponent(name)}&t=${Date.now()}`,
              {
                cache: "no-store",
              }
            );

            if (!response.ok) {
              console.warn(
                `Unable to find location: ${name}`
              );

              continue;
            }

            const data = await response.json();

            results.push({
              name: data.name,
              lat: Number(data.lat),
              lon: Number(data.lon),
              day: dayData.day,
            });
          }
        }

        if (cancelled) return;

        if (results.length === 0) {
          throw new Error(
            "No sightseeing locations could be found."
          );
        }

        console.log(
          "SUCCESSFULLY GEOCODED LOCATIONS:",
          results
        );

        console.log(
          "TOTAL LOCATIONS FOUND:",
          results.length
        );

        setMapLocations(results);

        // STEP 3: Calculate separate routes for each day
        const dayRoutes: DayRoute[] = [];

        for (const dayData of itineraryDays) {

          // Get only locations belonging to this day
          const dayLocations = results.filter(
            (location) =>
              location.day === dayData.day
          );

          // At least two locations are needed for a route
          if (dayLocations.length < 2) {
            continue;
          }

          const coordinates = dayLocations
            .map(
              (location) =>
                `${location.lon},${location.lat}`
            )
            .join(";");

          // Calculate driving route using OSRM
          const routeResponse = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
          );

          if (!routeResponse.ok) {
            console.warn(
              `Unable to calculate route for Day ${dayData.day}`
            );

            continue;
          }

          const routeData = await routeResponse.json();

          if (
            routeData.code !== "Ok" ||
            !routeData.routes?.length
          ) {
            console.warn(
              `No driving route found for Day ${dayData.day}`
            );

            continue;
          }

          // Store this day's route separately
          dayRoutes.push({
            day: dayData.day,

            coordinates:
              routeData.routes[0].geometry.coordinates.map(
                (point: [number, number]) => [
                  point[1],
                  point[0],
                ]
              ),
          });
        }

        if (!cancelled) {
          setRoutes(dayRoutes);
        }

      } catch (err) {

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load the trip map."
          );
        }

      } finally {

        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (itinerary.trim().length > 0) {
      loadMap();
    } else {
      setLoading(false);
      setError("No itinerary information available.");
    }

    return () => {
      cancelled = true;
    };

  }, [itinerary]);

  // Loading message
  if (loading) {
    return (
      <div className="trip-map-message">
        Loading your travel map...
      </div>
    );
  }

  // Error message
  if (error) {
    return (
      <div className="trip-map-message">
        {error}
      </div>
    );
  }

  // Display map
  return (
    <div
      className="trip-map-wrapper"
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
    >

      <MapContainer
        center={[
          mapLocations[0].lat,
          mapLocations[0].lon,
        ]}
        zoom={9}
        scrollWheelZoom
        className="trip-map-container"
      >

        {/* OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Automatically adjust map view */}
        <MapUpdater locations={mapLocations} />

        {/* Display location markers */}
        {mapLocations.map((location, index) => {

          const dayLocations = mapLocations.filter(
            (item) => item.day === location.day
          );

          const locationNumber =
            dayLocations.findIndex(
              (item) => item === location
            ) + 1;

          return (
            <Marker
              key={`${location.name}-${location.day}-${index}`}
              position={[
                location.lat,
                location.lon,
              ]}
            >
              <Popup>
                <strong>
                  Day {location.day}
                </strong>

                <br />

                {locationNumber}. {location.name}

              </Popup>
            </Marker>
          );
        })}

        {/* Display separate routes for each day */}
        {routes.map((route) => (

          <Polyline
            key={route.day}
            positions={route.coordinates}
            pathOptions={{
              color: "#c5a044",
              weight: 5,
              opacity: 0.85,
            }}
          />

        ))}

      </MapContainer>

    </div>
  );
}