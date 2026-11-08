import { MapPin, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Destination } from "../types";

export default function DestinationCard({
  destination,
}: {
  destination: Destination;
}) {
  return (
    <article className="lux-destination-card">
      <div className="lux-destination-image">
        <img
          src={destination.image}
          alt={destination.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1000";
          }}
        />

        <span className="lux-category-pill">
          {destination.category}
        </span>

        <div className="lux-image-overlay" />
      </div>

      <div className="lux-destination-content">
        <div className="lux-destination-location">
          <MapPin size={15} />
          {destination.location}
        </div>

        <h3>{destination.name}</h3>

        <p>{destination.description}</p>

        <div className="lux-destination-bottom">
          <div className="lux-destination-budget">
            <span>Estimated budget</span>
            <strong>{destination.budget}</strong>
          </div>

          <Link
            to={`/planner?destination=${encodeURIComponent(
              destination.name
            )}`}
            className="lux-destination-button"
          >
            Plan trip <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </article>
  );
}