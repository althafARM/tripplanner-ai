
import {
  ArrowRight,
  Map,
  Sparkles,
  ShieldCheck,
  Mountain,
  Waves,
  Landmark,
} from "lucide-react";

import { Link } from "react-router-dom";
import DestinationCard from "../components/DestinationCard";
import { sampleDestinations } from "../data/destinations";

export default function Home() {
  return (
    <>
      {/* HERO SECTION */}
      <section className="midnight-hero">
        <div className="midnight-hero-bg" />

        <div className="container midnight-hero-content">
          <span className="midnight-eyebrow">
            <Sparkles size={16} />
            YOUR PERSONAL AI TRAVEL COMPANION
          </span>

          <h1>
            Discover the world.
            <br />
            <em>We'll plan the journey.</em>
          </h1>

          <p>
            Tell us what you love. TripPlanner AI helps turn your
            travel ideas into a thoughtful, personalised itinerary.
          </p>

          <div className="midnight-hero-actions">
            <Link to="/planner" className="midnight-primary-button">
              Plan my trip <ArrowRight size={18} />
            </Link>

            <Link to="/explore" className="midnight-outline-button">
              Explore destinations
            </Link>
          </div>

          <div className="midnight-hero-note">
            <span />
            Start with beautiful places across Sri Lanka
          </div>
        </div>

        {/* HERO STATS */}
        <div className="midnight-hero-stats container">
          <div className="midnight-stat-item">
            <span className="midnight-stat-number">01</span>
            <div>
              <h3>Share Your Style</h3>
              <p>Tell us what you love</p>
            </div>
          </div>

          <div className="midnight-stat-divider" />

          <div className="midnight-stat-item">
            <span className="midnight-stat-number">02</span>
            <div>
              <h3>Get Your Itinerary</h3>
              <p>AI creates your travel plan</p>
            </div>
          </div>

          <div className="midnight-stat-divider" />

          <div className="midnight-stat-item">
            <span className="midnight-stat-number">03</span>
            <div>
              <h3>Enjoy Your Journey</h3>
              <p>Explore without the stress</p>
            </div>
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section className="midnight-section container">
        <div className="midnight-section-heading">
          <div>
            <span className="midnight-section-label">
              FIND YOUR NEXT ESCAPE
            </span>

            <h2>
              Places worth <em>discovering.</em>
            </h2>

            <p>
              From misty hills to sunny coastlines, find a place
              that feels right.
            </p>
          </div>

          <Link to="/explore" className="midnight-text-link">
            Explore all places <ArrowRight size={17} />
          </Link>
        </div>

        <div className="destination-grid">
          {sampleDestinations.slice(0, 3).map((destination) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
            />
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="midnight-feature-section">
        <div className="container midnight-feature-layout">

          <div className="midnight-feature-intro">
            <span className="midnight-feature-label">
              <Sparkles size={15} />
              A BETTER WAY TO TRAVEL
            </span>

            <h2>
              Your journey.
              <br />
              Your interests.
              <br />
              <em>Your own adventure.</em>
            </h2>

            <p>
              Forget complicated travel planning. Tell us what you love,
              choose your budget and let TripPlanner AI help create a
              journey that matches your style.
            </p>

            <Link to="/planner" className="midnight-feature-button">
              Try the AI Planner <ArrowRight size={18} />
            </Link>

            <div className="midnight-feature-note">
              <ShieldCheck size={17} />
              Smarter planning for better journeys
            </div>
          </div>

          <div className="midnight-feature-cards">

            <div className="midnight-feature-card">
              <div className="midnight-feature-icon">
                <Sparkles size={25} />
              </div>

              <div>
                <span>01 / PERSONALISATION</span>
                <h3>Personalised Planning</h3>
                <p>
                  Create travel plans based on your interests,
                  travel dates and budget.
                </p>
              </div>

              <ArrowRight className="midnight-feature-arrow" size={20} />
            </div>

            <div className="midnight-feature-card">
              <div className="midnight-feature-icon">
                <Map size={25} />
              </div>

              <div>
                <span>02 / DISCOVERY</span>
                <h3>Discover Amazing Places</h3>
                <p>
                  Explore beautiful destinations, nature,
                  beaches and cultural attractions.
                </p>
              </div>

              <ArrowRight className="midnight-feature-arrow" size={20} />
            </div>

            <div className="midnight-feature-card">
              <div className="midnight-feature-icon">
                <ShieldCheck size={25} />
              </div>

              <div>
                <span>03 / ASSISTANCE</span>
                <h3>Your AI Travel Assistant</h3>
                <p>
                  Get travel guidance and organise your
                  journey with an intelligent assistant.
                </p>
              </div>

              <ArrowRight className="midnight-feature-arrow" size={20} />
            </div>

          </div>
        </div>
      </section>

      {/* TRAVEL EXPERIENCES */}
      <section className="midnight-section container">
        <div className="midnight-section-heading">
          <div>
            <span className="midnight-section-label">
              CHOOSE YOUR EXPERIENCE
            </span>

            <h2>
              Travel in your <em>own way.</em>
            </h2>
          </div>
        </div>

        <div className="midnight-experience-grid">
          <div className="midnight-experience-card">
            <Mountain size={32} />
            <h3>Nature Escapes</h3>
            <p>
              Find calm in green hills and scenic trails.
            </p>
          </div>

          <div className="midnight-experience-card">
            <Waves size={32} />
            <h3>Beach Days</h3>
            <p>
              Slow down beside the ocean and sunshine.
            </p>
          </div>

          <div className="midnight-experience-card">
            <Landmark size={32} />
            <h3>Culture & Heritage</h3>
            <p>
              Discover local stories, food and history.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
