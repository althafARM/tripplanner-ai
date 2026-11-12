import { useEffect, useMemo, useState } from "react";

import {
  Search,
  SlidersHorizontal,
  Compass,
  Sparkles,
  MapPin,
  ArrowRight,
  X,
  Palmtree,
} from "lucide-react";

import { Link } from "react-router-dom";

import DestinationCard from "../components/DestinationCard";
import { getDestinations } from "../services/api";
import { sampleDestinations } from "../data/destinations";

import type { Destination } from "../types";

import "./Explore.css";

const categories = [
  "All",
  "Nature",
  "Beach",
  "Adventure",
  "Culture",
];

export default function Explore() {
  const [items, setItems] = useState<Destination[]>(sampleDestinations);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getDestinations()
      .then((data) => {
        if (!active) return;

        if (data.length) {
          const updatedDestinations = data.map((destination) => {
            const sampleDestination = sampleDestinations.find(
              (sample) =>
                sample.name.toLowerCase().trim() ===
                destination.name.toLowerCase().trim()
            );

            return {
              ...destination,
              image:
                sampleDestination?.image ||
                destination.image ||
                "",
            };
          });

          setItems(updatedDestinations);
        }

        setNotice("");
      })
      .catch(() => {
        if (active) {
          setNotice(
            "Showing sample destinations because the destination service is unavailable."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      items.filter(
        (destination) =>
          (category === "All" ||
            destination.category.toLowerCase() ===
              category.toLowerCase()) &&
          `${destination.name} ${destination.location} ${destination.description}`
            .toLowerCase()
            .includes(query.toLowerCase())
      ),
    [items, query, category]
  );

  const clearFilters = () => {
    setQuery("");
    setCategory("All");
  };

  return (
    <div className="tropical-explore-page">

      {/* EXPLORE HERO */}

      <section className="tropical-explore-hero">

        <div className="tropical-explore-hero-overlay" />

        <div className="tropical-explore-hero-content">

          <span className="tropical-explore-eyebrow">
            <Palmtree size={17} />
            DISCOVER THE BEAUTY OF SRI LANKA
          </span>

          <h1>
            Find your next
            <br />
            <span>tropical escape.</span>
          </h1>

          <p>
            Explore golden beaches, misty mountains,
            ancient wonders and unforgettable places
            across the beautiful island of Sri Lanka.
          </p>

          <Link
            to="/planner"
            className="tropical-explore-hero-button"
          >
            Plan your journey
            <ArrowRight size={19} />
          </Link>

          <div className="tropical-explore-hero-note">
            <Sparkles size={16} />
            Your next unforgettable journey starts here.
          </div>

        </div>

        <div className="tropical-explore-hero-bottom">
          <span>ISLAND OF PARADISE</span>
          <span>7°52' N — 80°46' E</span>
        </div>

      </section>


      {/* DESTINATION EXPLORER */}

      <section className="tropical-explore-content">

        {/* SECTION HEADING */}

        <div className="tropical-explore-heading">

          <div>
            <span className="tropical-explore-section-label">
              EXPLORE THE ISLAND
            </span>

            <h2>
              Discover your
              <span> perfect destination.</span>
            </h2>

            <p>
              From peaceful nature escapes to exciting adventures,
              find a destination that matches your travel style.
            </p>
          </div>

          <div className="tropical-explore-count">
            <Compass size={25} />

            <div>
              <strong>{filtered.length}</strong>
              <span>Destinations</span>
            </div>
          </div>

        </div>


        {/* SEARCH AND FILTERS */}

        <div className="tropical-explore-toolbar">

          <label className="tropical-search-box">

            <Search size={21} />

            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Where would you like to explore?"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}

          </label>


          <div className="tropical-filter-heading">
            <SlidersHorizontal size={18} />
            <span>Explore by category</span>
          </div>


          <div className="tropical-category-filters">

            {categories.map((item) => (

              <button
                key={item}
                type="button"
                className={
                  category === item
                    ? "tropical-filter-chip active"
                    : "tropical-filter-chip"
                }
                onClick={() => setCategory(item)}
              >
                {item}
              </button>

            ))}

          </div>

        </div>


        {/* BACKEND NOTICE */}

        {notice && (
          <div className="tropical-explore-notice">
            <MapPin size={18} />
            {notice}
          </div>
        )}


        {/* RESULTS HEADING */}

        <div className="tropical-results-line">

          <div>
            <h3>Beautiful places to discover</h3>

            <span>
              {filtered.length}{" "}
              {filtered.length === 1 ? "destination" : "destinations"} found
            </span>
          </div>

          {(query || category !== "All") && (
            <button
              type="button"
              className="tropical-reset-filters"
              onClick={clearFilters}
            >
              <X size={16} />
              Clear filters
            </button>
          )}

        </div>


        {/* LOADING */}

        {loading ? (

          <div className="tropical-explore-loading">
            <div className="tropical-loading-spinner" />
            <p>Discovering beautiful destinations...</p>
          </div>

        ) : filtered.length > 0 ? (

          <div className="tropical-explore-grid">

            {filtered.map((destination) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
              />
            ))}

          </div>

        ) : (

          <div className="tropical-explore-empty">

            <div className="tropical-empty-icon">
              <Search size={32} />
            </div>

            <h3>No destinations found</h3>

            <p>
              We couldn't find any places matching your search.
              Try another keyword or category.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="tropical-empty-button"
            >
              Explore all destinations
            </button>

          </div>

        )}

      </section>

    </div>
  );
}