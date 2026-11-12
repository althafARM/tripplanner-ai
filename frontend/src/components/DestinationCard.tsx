import { useEffect, useRef, useState } from "react";
import {
  MapPin,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

import type { Destination } from "../types";
import "./DestinationCard.css";

interface DestinationCardProps {
  destination: Destination;
}

export default function DestinationCard({
  destination,
}: DestinationCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // Generate video filename
  const videoName = destination.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const videoPath = `/videos/destinations/${videoName}.mp4`;

  // Play video on hover
  useEffect(() => {
    const video = videoRef.current;

    if (!video || !isVideoReady) return;

    if (isHovered) {
      video.play().catch((error) => {
        console.error("Video playback error:", error);
      });
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isHovered, isVideoReady]);

  return (
    <article
      className="tropical-destination-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* DESTINATION IMAGE */}
      <div className="tropical-destination-image">

        {/* PNG PHOTO - ALWAYS VISIBLE BEFORE HOVER */}
        <img
          src={destination.image}
          alt={destination.name}
          className="tropical-destination-fallback"
          onError={(event) => {
            console.error(
              "Image failed to load:",
              destination.image
            );

            event.currentTarget.style.background = "#07505e";
          }}
        />

        {/* DESTINATION VIDEO */}
        <video
          ref={videoRef}
          className={`tropical-destination-video ${
            isHovered && isVideoReady ? "video-playing" : ""
          }`}
          src={videoPath}
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => setIsVideoReady(true)}
          onError={() => setIsVideoReady(false)}
        />

        {/* IMAGE OVERLAY */}
        <div className="tropical-destination-overlay" />

        {/* CATEGORY */}
        <span className="tropical-category-pill">
          <Sparkles size={12} />
          {destination.category}
        </span>

        {/* VIDEO INDICATOR */}
        <div className="tropical-video-indicator">
          <span className="tropical-video-dot" />

          {isHovered && isVideoReady
            ? "NOW PLAYING"
            : "HOVER TO EXPLORE"}
        </div>

        {/* LOCATION */}
        <div className="tropical-image-location">
          <MapPin size={15} />
          <span>{destination.location}</span>
        </div>

      </div>

      {/* DESTINATION INFORMATION */}
      <div className="tropical-destination-content">

        <div className="tropical-destination-heading">
          <h3>{destination.name}</h3>
          <ArrowUpRight size={21} />
        </div>

        <p className="tropical-destination-description">
          {destination.description}
        </p>

        {/* DESTINATION DETAILS */}
        <div className="tropical-destination-details">

          <div className="tropical-destination-budget">
            <span>ESTIMATED BUDGET</span>
            <strong>{destination.budget}</strong>
          </div>

          <Link
            to="/planner"
            className="tropical-plan-button"
          >
            <span>Plan Your Trip</span>
            <ArrowUpRight size={17} />
          </Link>

        </div>

      </div>
    </article>
  );
}