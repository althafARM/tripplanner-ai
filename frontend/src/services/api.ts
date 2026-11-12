import axios from "axios";
import type { Destination, TripRequest } from "../types";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add the logged-in user's token to protected requests.
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("user_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Get all destinations.
export async function getDestinations(): Promise<Destination[]> {
  const response = await API.get("/api/destinations/");
  return response.data.destinations ?? [];
}

// Generate AI travel itinerary.
export async function generateTrip(payload: TripRequest) {
  const response = await API.post("/api/trips/generate", payload);
  return response.data;
}

// Save a generated trip.
export async function saveTrip(payload: {
  destination: string;
  start_location: string;
  days: number;
  budget: string;
  travel_style: string;
  travellers: number;
  itinerary: string;
}) {
  const response = await API.post("/api/trips/save", payload);
  return response.data;
}

// Get trips belonging to the logged-in user.
export async function getMyTrips() {
  const response = await API.get("/api/trips/my-trips");
  return response.data;
}

// Delete a saved trip.
export async function deleteTrip(tripId: number) {
  const response = await API.delete(`/api/trips/${tripId}`);
  return response.data;
}

export async function updateTrip(
  tripId: number,
  payload: {
    destination: string;
    start_location: string;
    days: number;
    budget: string;
    travel_style: string;
    travellers: number;
  }
) {
  const response = await API.put(
    `/api/trips/${tripId}`,
    payload
  );

  return response.data;
}

export async function regenerateTrip(tripId: number) {
  const response = await API.post(
    `/api/trips/${tripId}/regenerate`
  );

  return response.data;
}
export default API;