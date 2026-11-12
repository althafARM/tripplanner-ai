import { useRef, useState } from "react";

import {
  ArrowRight,
  Map,
  Sparkles,
  ShieldCheck,
  Mountain,
  Waves,
  Landmark,
  Play,
  Pause,
} from "lucide-react";

import { Link } from "react-router-dom";

import DestinationCard from "../components/DestinationCard";
import { sampleDestinations } from "../data/destinations";

import "./Home.css";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const toggleVideo = async () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      try {
        await videoRef.current.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="tropical-home">

      {/* HERO SECTION */}

      <section className="tropical-hero">

        <video
          ref={videoRef}
          className="tropical-hero-video"
          autoPlay
          muted
          loop
          playsInline
          poster="/images/sigiriya.png"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source
            src="/videos/sri-lanka-hero.mp4"
            type="video/mp4"
          />
        </video>

        <div className="tropical-hero-overlay" />

        <div className="tropical-hero-content container">

          <span className="tropical-eyebrow">
            <Sparkles size={17} />
            YOUR PERSONAL AI TRAVEL COMPANION
          </span>

          <h1>
            Discover the beauty
            <br />
            of <span>Sri Lanka.</span>
          </h1>

          <p>
            From golden beaches to misty mountains,
            discover incredible destinations and let
            AI create a journey made just for you.
          </p>

          <div className="tropical-hero-actions">

            <Link
              to="/planner"
              className="tropical-primary-button"
            >
              Plan My Trip
              <ArrowRight size={19} />
            </Link>

            <Link
              to="/explore"
              className="tropical-secondary-button"
            >
              Explore Destinations
            </Link>

          </div>

          <div className="tropical-hero-note">
            <span />
            Experience the magic of the island
          </div>

        </div>

        <button
          type="button"
          className="tropical-video-control"
          onClick={toggleVideo}
          aria-label={isPlaying ? "Pause background video" : "Play background video"}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          {isPlaying ? "Pause video" : "Play video"}
        </button>

        <div className="tropical-hero-bottom">
          <span>01 — DISCOVER</span>
          <span>SRI LANKA · THE PEARL OF THE INDIAN OCEAN</span>
        </div>

      </section>


      {/* INTRODUCTION */}

      <section className="tropical-intro container">

        <div className="tropical-intro-label">
          <span />
          YOUR NEXT ADVENTURE STARTS HERE
        </div>

        <h2>
          One island.
          <br />
          <span>A thousand experiences.</span>
        </h2>

        <p>
          Discover beautiful places, experience local culture
          and create unforgettable memories with your
          personal AI travel planner.
        </p>

      </section>


      {/* DESTINATIONS */}

      <section className="tropical-destinations container">

        <div className="tropical-section-heading">

          <div>
            <span>EXPLORE THE ISLAND</span>

            <h2>
              Find your next
              <em> escape.</em>
            </h2>

            <p>
              Explore the places that make Sri Lanka special.
            </p>
          </div>

          <Link
            to="/explore"
            className="tropical-view-all"
          >
            View all destinations
            <ArrowRight size={18} />
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


      {/* TRAVEL EXPERIENCES */}

      <section className="tropical-experiences">

        <div className="container">

          <div className="tropical-section-heading">

            <div>
              <span>EXPERIENCE MORE</span>

              <h2>
                Find the journey
                <em> you love.</em>
              </h2>
            </div>

          </div>

          <div className="tropical-experience-grid">

            <div className="tropical-experience-card nature">

              <Mountain size={32} />

              <div>
                <span>01 / NATURE</span>
                <h3>Mountain Adventures</h3>
                <p>
                  Explore green hills, waterfalls and
                  breathtaking landscapes.
                </p>
              </div>

            </div>

            <div className="tropical-experience-card beach">

              <Waves size={32} />

              <div>
                <span>02 / BEACH</span>
                <h3>Tropical Beach Escapes</h3>
                <p>
                  Enjoy golden sunshine, beautiful beaches
                  and ocean adventures.
                </p>
              </div>

            </div>

            <div className="tropical-experience-card culture">

              <Landmark size={32} />

              <div>
                <span>03 / CULTURE</span>
                <h3>Culture & Heritage</h3>
                <p>
                  Discover ancient cities, traditions
                  and Sri Lankan food.
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* AI TRAVEL PLANNER FEATURE */}

      <section className="tropical-ai-section container">

        <div className="tropical-ai-content">

          <span>
            <Sparkles size={17} />
            TRAVEL SMARTER WITH AI
          </span>

          <h2>
            Your dream trip.
            <br />
            <em>Planned intelligently.</em>
          </h2>

          <p>
            Choose your destination, travel dates, budget
            and interests. TripPlanner AI creates a
            personalised itinerary and estimates your
            travel expenses.
          </p>

          <Link
            to="/planner"
            className="tropical-primary-button"
          >
            Start Planning
            <ArrowRight size={19} />
          </Link>

        </div>

        <div className="tropical-ai-benefits">

          <div>
            <Sparkles size={24} />
            <h3>AI Personalisation</h3>
            <p>Travel plans based on your interests.</p>
          </div>

          <div>
            <Map size={24} />
            <h3>Destination Discovery</h3>
            <p>Find amazing places across Sri Lanka.</p>
          </div>

          <div>
            <ShieldCheck size={24} />
            <h3>Smart Cost Estimation</h3>
            <p>Understand your estimated travel expenses.</p>
          </div>

        </div>

      </section>


      {/* FINAL CALL TO ACTION */}

      <section className="tropical-final-cta">

        <div className="container">

          <span>YOUR SRI LANKAN ADVENTURE AWAITS</span>

          <h2>
            Don't just dream about it.
            <br />
            <em>Experience it.</em>
          </h2>

          <Link
            to="/planner"
            className="tropical-primary-button"
          >
            Create My Journey
            <ArrowRight size={19} />
          </Link>

        </div>

      </section>

    </div>
  );
}