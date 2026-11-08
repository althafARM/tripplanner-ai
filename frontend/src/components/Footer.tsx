import { Link } from "react-router-dom";
import {
  Compass,
  ArrowUpRight,
  MapPin,
  Heart,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="lux-footer">
      <div className="lux-footer-container">

        {/* Brand section */}
        <div className="lux-footer-brand-section">
          <Link to="/home" className="lux-footer-brand">
            <span className="lux-footer-icon">
              <Compass size={25} />
            </span>

            <span>
              TripPlanner <b>AI</b>
              <small>TRAVEL INTELLIGENTLY</small>
            </span>
          </Link>

          <p>
            Discover new destinations, plan unforgettable journeys,
            and make every trip meaningful with AI.
          </p>

          <div className="lux-footer-location">
            <MapPin size={16} />
            <span>Explore the world with confidence</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="lux-footer-navigation">
          <h3>Explore</h3>
          <Link to="/home">Home</Link>
          <Link to="/explore">Destinations</Link>
          <Link to="/my-trips">My Trips</Link>
        </div>

        {/* Services */}
        <div className="lux-footer-navigation">
          <h3>Our Services</h3>
          <Link to="/planner">Plan a Trip</Link>
          <Link to="/chat">AI Assistant</Link>
          <Link to="/profile">My Profile</Link>
        </div>

        {/* CTA */}
        <div className="lux-footer-cta">
          <span className="lux-footer-cta-label">YOUR NEXT ADVENTURE</span>
          <h3>Ready to explore somewhere new?</h3>

          <Link to="/planner" className="lux-footer-button">
            Start Planning <ArrowUpRight size={17} />
          </Link>
        </div>

      </div>

      {/* Bottom section */}
      <div className="lux-footer-bottom">
        <p>
          © {new Date().getFullYear()} TripPlanner AI. All rights reserved.
        </p>

        <span>
          Made with <Heart size={14} /> for travellers.
        </span>
      </div>
    </footer>
  );
}