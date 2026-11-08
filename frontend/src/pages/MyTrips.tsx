
import { Link } from "react-router-dom";
import {
  Compass,
  Plus,
  MapPin,
  Sparkles,
  Plane,
  CalendarDays,
  ArrowRight,
} from "lucide-react";

export default function MyTrips() {
  return (
    <div className="page-shell midnight-trips-page">

      {/* Page Heading */}
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

      {/* Main Content */}
      <section className="container midnight-trips-content">

        {/* Dashboard Welcome */}
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

        {/* Trip Statistics */}
        <div className="midnight-trip-stats">
          <div className="midnight-trip-stat-card">
            <div className="midnight-trip-stat-icon">
              <Compass size={21} />
            </div>

            <div>
              <strong>0</strong>
              <span>Total Trips</span>
            </div>
          </div>

          <div className="midnight-trip-stat-card">
            <div className="midnight-trip-stat-icon">
              <MapPin size={21} />
            </div>

            <div>
              <strong>0</strong>
              <span>Destinations</span>
            </div>
          </div>

          <div className="midnight-trip-stat-card">
            <div className="midnight-trip-stat-icon">
              <CalendarDays size={21} />
            </div>

            <div>
              <strong>0</strong>
              <span>Upcoming Trips</span>
            </div>
          </div>
        </div>

        {/* Empty State */}
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
            You haven't created a trip yet. Start planning
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
      </section>
    </div>
  );
}
