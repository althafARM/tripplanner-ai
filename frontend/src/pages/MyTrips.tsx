import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";

import {
  Compass,
  Plus,
  MapPin,
  Sparkles,
  Plane,
  CalendarDays,
  ArrowRight,
  Users,
  Wallet,
  Trash2,
  RefreshCw,
  Clock,
  ChevronDown,
  ChevronUp,
  Pencil,
  Save,
} from "lucide-react";

import { getMyTrips, deleteTrip, updateTrip, regenerateTrip} from "../services/api";
import TripMap from "../components/TripMap";
import "./MyTrips.css";

interface SavedTrip {
  id: number;
  destination: string;
  start_location: string;
  days: number;
  budget: string;
  travel_style: string;
  travellers: number;
  itinerary: string;
  created_at: string;
}

function getGoogleMapsRouteUrl(trip: SavedTrip) {
  // Recognised Sri Lankan sightseeing locations
  const knownLocations = [
    "Sigiriya Rock Fortress",
    "Pidurangala Rock",
    "Dambulla Cave Temple",
    "Kandalama Lake",
  ];

  // Find locations actually mentioned in the itinerary
  const itinerary = trip.itinerary.toLowerCase();

  const stops = knownLocations.filter((location) =>
    itinerary.includes(location.toLowerCase())
  );

  // Add the main destination first
  const allStops = [
    trip.destination,
    ...stops,
  ].filter(
    (location, index, array) =>
      array.findIndex(
        (item) => item.toLowerCase() === location.toLowerCase()
      ) === index
  );

  // The last sightseeing location becomes the destination
  const finalDestination =
    allStops.length > 0
      ? allStops[allStops.length - 1]
      : trip.destination;

  // Other locations become intermediate stops
  const waypoints = allStops.slice(0, -1);

  const params = new URLSearchParams({
    api: "1",
    origin: trip.start_location,
    destination: finalDestination,
    travelmode: "driving",
  });

  if (waypoints.length > 0) {
    params.set("waypoints", waypoints.join("|"));
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}


export default function MyTrips() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [editForm, setEditForm] = useState({
    destination: "",
    start_location: "",
    days: 1,
    budget: "",
    travel_style: "",
    travellers: 1,
  });

  const [savingEdit, setSavingEdit] = useState(false);
  const [editMessage, setEditMessage] = useState("");
  const [regeneratingId, setRegeneratingId] = useState<number | null>(null);

  // Load saved trips from PostgreSQL.
  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyTrips();

      setTrips(response.trips ?? []);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to load your trips.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  // Delete a saved trip.
  const handleDeleteTrip = async (tripId: number) => {
    try {
      setDeletingId(tripId);

      await deleteTrip(tripId);

      setTrips((previous) =>
        previous.filter((trip) => trip.id !== tripId)
      );

      if (expandedId === tripId) {
        setExpandedId(null);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unable to delete this trip.";

      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditClick = (trip: SavedTrip) => {
    setEditForm({
      destination: trip.destination,
      start_location: trip.start_location,
      days: trip.days,
      budget: trip.budget,
      travel_style: trip.travel_style,
      travellers: trip.travellers,
    });

    setEditingId(trip.id);
    setEditMessage("");
  };

  const handleUpdateTrip = async (tripId: number) => {
    try {
      setSavingEdit(true);
      setEditMessage("");

      await updateTrip(tripId, editForm);

      setTrips((previous) =>
        previous.map((trip) =>
          trip.id === tripId
            ? { ...trip, ...editForm }
            : trip
        )
      );

      setEditingId(null);
      setEditMessage("Trip updated successfully!");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to update trip.";

      setEditMessage(message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleRegenerateTrip = async (tripId: number) => {
    try {
      setRegeneratingId(tripId);
      setError("");

      const response = await regenerateTrip(tripId);

      setTrips((previous) =>
        previous.map((trip) =>
          trip.id === tripId
            ? {
                ...trip,
                itinerary: response.trip.itinerary,
              }
            : trip
        )
      );

      setExpandedId(tripId);

    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to regenerate itinerary.";

      setError(message);

    } finally {
      setRegeneratingId(null);
    }
  };

  const uniqueDestinations = new Set(
    trips.map((trip) => trip.destination.toLowerCase())
  ).size;

  const totalTravellers = trips.reduce(
    (total, trip) => total + trip.travellers,
    0
  );

  return (
    <div className="page-shell midnight-trips-page">

      {/* PAGE HEADING */}
      <section className="midnight-trips-header">
        <div className="container">

          <span className="midnight-trips-eyebrow">
            <Compass size={15} />
            YOUR PERSONAL TRAVEL SPACE
          </span>

          <h1>
            Every journey starts
            <br />
            <span>with a dream.</span>
          </h1>

          <p>
            Keep your travel plans organised and get ready
            for your next unforgettable adventure.
          </p>

        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="container midnight-trips-content">

        {/* DASHBOARD WELCOME */}
        <div className="midnight-trips-welcome">

          <div>
            <span className="midnight-trips-label">
              YOUR TRAVEL DASHBOARD
            </span>

            <h2>My Trips</h2>

            <p>
              All your travel adventures, organised in one place.
            </p>
          </div>

          <Link
            to="/planner"
            className="midnight-create-trip-button"
          >
            <Plus size={18} />
            Create New Trip
          </Link>

        </div>

        {/* TRIP STATISTICS */}
        <div className="midnight-trip-stats">

          <div className="midnight-trip-stat-card">
            <div className="midnight-trip-stat-icon">
              <Compass size={21} />
            </div>

            <div>
              <strong>{trips.length}</strong>
              <span>Total Trips</span>
            </div>
          </div>

          <div className="midnight-trip-stat-card">
            <div className="midnight-trip-stat-icon">
              <MapPin size={21} />
            </div>

            <div>
              <strong>{uniqueDestinations}</strong>
              <span>Destinations</span>
            </div>
          </div>

          <div className="midnight-trip-stat-card">
            <div className="midnight-trip-stat-icon">
              <Users size={21} />
            </div>

            <div>
              <strong>{totalTravellers}</strong>
              <span>Total Travellers</span>
            </div>
          </div>

        </div>

        {/* LOADING */}
        {loading && (
          <div className="midnight-trips-loading">
            <RefreshCw className="midnight-spin" size={30} />

            <h3>Loading your adventures...</h3>

            <p>Please wait while we retrieve your saved trips.</p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="midnight-trips-error">
            <p>{error}</p>

            <button onClick={fetchTrips}>
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && trips.length === 0 && (
          <div className="midnight-trips-empty">

            <div className="midnight-trips-illustration">

              <div className="midnight-trips-circle">
                <Plane size={53} />
              </div>

              <span className="midnight-trips-sparkle sparkle-one">
                ✦
              </span>

              <span className="midnight-trips-sparkle sparkle-two">
                ✧
              </span>

              <span className="midnight-trips-sparkle sparkle-three">
                ✦
              </span>

            </div>

            <span className="midnight-trips-empty-label">
              YOUR ADVENTURE STARTS HERE
            </span>

            <h2>
              Your next adventure
              <br />
              <span>is waiting for you.</span>
            </h2>

            <p>
              You haven't saved a trip yet. Start planning
              your journey and keep all your travel plans
              together in one place.
            </p>

            <Link
              to="/planner"
              className="midnight-trips-main-button"
            >
              <Sparkles size={18} />
              Plan Your First Trip
              <ArrowRight size={18} />
            </Link>

            <div className="midnight-trips-bottom-note">
              <Compass size={15} />
              Discover places. Create memories. Travel smarter.
            </div>

          </div>
        )}

        {/* SAVED TRIPS */}
        {!loading && !error && trips.length > 0 && (
          <div className="midnight-saved-trips">

            <div className="midnight-saved-trips-heading">
              <div>
                <span>YOUR COLLECTION</span>
                <h2>Your saved adventures</h2>
              </div>

              <span className="midnight-trip-count">
                {trips.length} {trips.length === 1 ? "Trip" : "Trips"}
              </span>
            </div>

            <div className="midnight-saved-trips-grid">

              {trips.map((trip) => (
                <article
                  className="midnight-saved-trip-card"
                  key={trip.id}
                  onClick={() =>
                    setExpandedId(expandedId === trip.id ? null : trip.id)
                  }
                  style={{ cursor: "pointer" }}
                >

                  {/* CARD HEADER */}
                  <div className="midnight-saved-trip-header">

                  <button
                    type="button"
                    className="midnight-saved-trip-icon"
                    title="View all trip locations on Google Maps"
                    onClick={(event) => {
                      event.stopPropagation();

                      const mapsUrl = getGoogleMapsRouteUrl(trip);

                      window.open(
                        mapsUrl,
                        "_blank",
                        "noopener,noreferrer"
                      );
                    }}
                  >
                    <MapPin size={23} />
                  </button>

                    <button
                      className="midnight-trip-delete-button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteTrip(trip.id);
                      }}
                      disabled={deletingId === trip.id}
                      title="Delete trip"
                    >
                      {deletingId === trip.id ? (
                        <RefreshCw
                          size={18}
                          className="midnight-spin"
                        />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>

                    <button
                      className="midnight-trip-edit-button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleEditClick(trip);
                      }}
                      title="Edit trip"
                    >
                      <Pencil size={18} />
                    </button>

                  </div>

                  {editingId === trip.id ? (
                    <form
                      className="midnight-trip-edit-form"
                      onClick={(event) => event.stopPropagation()}
                      onSubmit={(event) => {
                        event.preventDefault();
                        handleUpdateTrip(trip.id);
                      }}
                    >
                      <h3>Edit Your Trip</h3>

                      <label>Destination</label>
                      <input
                        type="text"
                        value={editForm.destination}
                        onChange={(event) =>
                          setEditForm({
                            ...editForm,
                            destination: event.target.value,
                          })
                        }
                        required
                      />

                      <label>Starting Location</label>
                      <input
                        type="text"
                        value={editForm.start_location}
                        onChange={(event) =>
                          setEditForm({
                            ...editForm,
                            start_location: event.target.value,
                          })
                        }
                        required
                      />

                      <label>Number of Days</label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={editForm.days}
                        onChange={(event) =>
                          setEditForm({
                            ...editForm,
                            days: Number(event.target.value),
                          })
                        }
                        required
                      />

                      <label>Budget</label>
                      <input
                        type="text"
                        value={editForm.budget}
                        onChange={(event) =>
                          setEditForm({
                            ...editForm,
                            budget: event.target.value,
                          })
                        }
                      />

                      <label>Travel Style</label>
                      <input
                        type="text"
                        value={editForm.travel_style}
                        onChange={(event) =>
                          setEditForm({
                            ...editForm,
                            travel_style: event.target.value,
                          })
                        }
                      />

                      <label>Number of Travellers</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={editForm.travellers}
                        onChange={(event) =>
                          setEditForm({
                            ...editForm,
                            travellers: Number(event.target.value),
                          })
                        }
                        required
                      />

                      <button type="submit" disabled={savingEdit}>
                        <Save size={16} />
                        {savingEdit ? "Saving..." : "Save Changes"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>

                      {editMessage && <p>{editMessage}</p>}
                    </form>
                                    ) : (
                    <>
                      {/* DESTINATION */}
                      <span className="midnight-saved-trip-label">
                        YOUR DESTINATION
                      </span>

                      <h3>{trip.destination}</h3>

                      <p className="midnight-saved-trip-route">
                        <MapPin size={15} />
                        From {trip.start_location}
                      </p>

                      {/* TRIP DETAILS */}
                      <div className="midnight-saved-trip-details">
                        <div>
                          <CalendarDays size={17} />
                          <span>{trip.days} Days</span>
                        </div>

                        <div>
                          <Users size={17} />
                          <span>{trip.travellers} Travellers</span>
                        </div>

                        <div>
                          <Wallet size={17} />
                          <span>{trip.budget}</span>
                        </div>

                        <div>
                          <Sparkles size={17} />
                          <span>{trip.travel_style}</span>
                        </div>
                      </div>

                      {/* CREATED DATE */}
                      <div className="midnight-saved-trip-date">
                        <Clock size={15} />
                        Saved on{" "}
                        {new Date(trip.created_at).toLocaleDateString()}
                      </div>

                      {/* VIEW ITINERARY */}
                      <button
                        className="midnight-view-itinerary-button"
                        onClick={(event) => {
                          event.stopPropagation();

                          setExpandedId(
                            expandedId === trip.id ? null : trip.id
                          );
                        }}
                      >
                        {expandedId === trip.id ? (
                          <>
                            Hide Itinerary
                            <ChevronUp size={18} />
                          </>
                        ) : (
                          <>
                            View Itinerary
                            <ChevronDown size={18} />
                          </>
                        )}
                      </button>

                      {/* REGENERATE ITINERARY */}
                      <button
                        className="midnight-regenerate-button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleRegenerateTrip(trip.id);
                        }}
                        disabled={regeneratingId === trip.id}
                      >
                        <Sparkles size={17} />

                        {regeneratingId === trip.id
                          ? "Generating New Itinerary..."
                          : "Regenerate Itinerary"}

                        {regeneratingId === trip.id && (
                          <RefreshCw size={16} className="midnight-spin" />
                        )}
                      </button>

                      {/* ITINERARY CONTENT */}
                      {expandedId === trip.id && (
                        <div className="midnight-saved-itinerary">
                          <div className="saved-itinerary-heading">
                            <Sparkles size={20} />
                            <h3>Your Travel Itinerary</h3>
                          </div>

                          {/* Interactive Travel Map */}
                          <TripMap itinerary={trip.itinerary} />

                          <ReactMarkdown>
                            {trip.itinerary}
                          </ReactMarkdown>
                        </div>
                      )}
                    </>
                  )}

                </article>
              ))}

            </div>

          </div>
        )}

      </section>
    </div>
  );
}