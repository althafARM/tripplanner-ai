
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Compass,
  Sparkles,
  MapPin,
  ArrowRight,
  X,
} from "lucide-react";

import { Link } from "react-router-dom";
import DestinationCard from "../components/DestinationCard";
import { getDestinations } from "../services/api";
import { sampleDestinations } from "../data/destinations";
import type { Destination } from "../types";

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
          setItems(data);
        }

        setNotice("");
      })
      .catch(() => {
        if (active) {
          setNotice(
            "Showing sample destinations. Connect the backend to load its destination list."
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
    <div className="page-shell midnight-explore-page">

      {/* Explore Hero */}
      <section className="midnight-explore-hero">
        <div className="midnight-explore-overlay" />

        <div className="container midnight-explore-hero-content">
          <span className="midnight-explore-eyebrow">
            <Compass size={15} />
            DISCOVER YOUR NEXT ADVENTURE
          </span>

          <h1>
            Explore beautiful places.
            <br />
            <span>Collect unforgettable moments.</span>
          </h1>

          <p>
            From peaceful beaches to breathtaking mountains,
            discover destinations that make every journey special.
          </p>

          <Link
            to="/planner"
            className="midnight-explore-hero-button"
          >
            Plan your journey
            <ArrowRight size={18} />
          </Link>

          <div className="midnight-explore-hero-note">
            <Sparkles size={15} />
            Discover amazing destinations across Sri Lanka
          </div>
        </div>
      </section>

      {/* Destination Explorer */}
      <section className="container midnight-explore-content">

        <div className="midnight-explore-heading">
          <div>
            <span className="midnight-explore-section-label">
              EXPLORE THE POSSIBILITIES
            </span>

            <h2>
              Find your <span>perfect destination.</span>
            </h2>

            <p>
              Search, discover and find the right place for your next trip.
            </p>
          </div>

          <div className="midnight-explore-count">
            <Compass size={21} />
            <div>
              <strong>{filtered.length}</strong>
              <span>Places to explore</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="midnight-explore-toolbar">

          <label className="midnight-search-box">
            <Search size={20} />

            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search destinations, locations..."
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            )}
          </label>

          <div className="midnight-filter-heading">
            <SlidersHorizontal size={18} />
            <span>Explore by category</span>
          </div>

          <div className="midnight-category-filters">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={
                  category === item
                    ? "midnight-filter-chip active"
                    : "midnight-filter-chip"
                }
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Backend Notice */}
        {notice && (
          <div className="midnight-explore-notice">
            <MapPin size={17} />
            {notice}
          </div>
        )}

        {/* Results */}
        <div className="midnight-results-line">
          <div>
            <h3>Discover destinations</h3>
            <span>
              {filtered.length} {filtered.length === 1 ? "place" : "places"} found
            </span>
          </div>

          {(query || category !== "All") && (
            <button
              type="button"
              className="midnight-reset-filters"
              onClick={clearFilters}
            >
              <X size={15} />
              Clear filters
            </button>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="midnight-explore-loading">
            <div className="midnight-loading-spinner" />
            <p>Discovering beautiful destinations...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="destination-grid midnight-explore-grid">
            {filtered.map((destination) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
              />
            ))}
          </div>
        ) : (
          <div className="midnight-explore-empty">
            <div className="midnight-empty-icon">
              <Search size={30} />
            </div>

            <h3>No destinations found</h3>

            <p>
              We couldn't find any places matching your search.
              Try another keyword or category.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="midnight-empty-button"
            >
              Explore all destinations
            </button>
          </div>
        )}

      </section>
    </div>
  );
}
