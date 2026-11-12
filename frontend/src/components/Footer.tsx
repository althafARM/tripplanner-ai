import { Link } from "react-router-dom";

import {
  Compass,
  ArrowUpRight,
  MapPin,
  Heart,
  Palmtree,
  Waves,
} from "lucide-react";

import "./Footer.css";

export default function Footer() {
  return (
    <footer className="tropical-footer">

      {/* MAIN FOOTER */}

      <div className="tropical-footer-container">

        {/* BRAND */}

        <div className="tropical-footer-brand-section">

          <Link to="/home" className="tropical-footer-brand">

            <span className="tropical-footer-icon">
              <Compass size={27} />
            </span>

            <span className="tropical-footer-brand-text">
              TripPlanner <b>AI</b>
              <small>EXPLORE • DISCOVER • EXPERIENCE</small>
            </span>

          </Link>

          <p>
            Discover beautiful destinations, plan unforgettable
            journeys and experience the world in a smarter way
            with your AI travel companion.
          </p>

          <div className="tropical-footer-location">
            <MapPin size={17} />
            <span>Made for explorers everywhere</span>
          </div>

          <div className="tropical-footer-decoration">
            <Palmtree size={20} />
            <Waves size={23} />
          </div>

        </div>


        {/* EXPLORE */}

        <div className="tropical-footer-navigation">

          <h3>Explore</h3>

          <Link to="/home">Home</Link>
          <Link to="/explore">Destinations</Link>
          <Link to="/my-trips">My Trips</Link>
          <Link to="/profile">My Profile</Link>

        </div>


        {/* SERVICES */}

        <div className="tropical-footer-navigation">

          <h3>Travel Services</h3>

          <Link to="/planner">Plan a Trip</Link>
          <Link to="/chat">AI Assistant</Link>
          <Link to="/explore">Discover Places</Link>

        </div>


        {/* CALL TO ACTION */}

        <div className="tropical-footer-cta">

          <span className="tropical-footer-cta-label">
            YOUR NEXT ADVENTURE
          </span>

          <h3>
            The world is waiting.
            <span> Let's explore.</span>
          </h3>

          <p>
            Create your next travel experience with TripPlanner AI.
          </p>

          <Link
            to="/planner"
            className="tropical-footer-button"
          >
            Start Planning
            <ArrowUpRight size={18} />
          </Link>

        </div>

      </div>


      {/* BOTTOM FOOTER */}

      <div className="tropical-footer-bottom">

        <p>
          © {new Date().getFullYear()} TripPlanner AI.
          All rights reserved.
        </p>

        <span>
          Made with <Heart size={14} fill="currentColor" />
          for travellers.
        </span>

      </div>

    </footer>
  );
}