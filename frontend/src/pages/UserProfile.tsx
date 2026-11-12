import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Calendar,
  Loader2,
  ShieldCheck,
  Compass,
  ArrowLeft,
} from "lucide-react";

import { Link } from "react-router-dom";
import { getUserProfile } from "../services/authService";
import "./UserProfile.css";

interface UserProfileData {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export default function UserProfile() {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getUserProfile();
        setProfile(data.user);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="tropical-profile-loading">
        <Loader2 size={38} className="tropical-profile-spinner" />
        <h3>Loading your profile...</h3>
        <p>Preparing your personal travel space.</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="tropical-profile-error-page">
        <div className="tropical-profile-error-card">
          <ShieldCheck size={38} />

          <h2>Profile unavailable</h2>

          <p>{error || "Profile information not available."}</p>

          <Link to="/home" className="tropical-profile-back-button">
            <ArrowLeft size={17} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Not available";

  const initials = profile.name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="tropical-profile-page">

      {/* BACKGROUND VIDEO */}

      <video
        className="tropical-profile-video"
        autoPlay
        muted
        loop
        playsInline
        poster="/images/sri-lanka-hero.jpg"
      >
        <source
          src="/videos/sri-lanka-hero.mp4"
          type="video/mp4"
        />
      </video>

      {/* VIDEO OVERLAY */}

      <div className="tropical-profile-overlay" />

      {/* PROFILE CONTENT */}

      <div className="tropical-profile-container">

        {/* HEADING */}

        <div className="tropical-profile-heading">

          <span className="tropical-profile-eyebrow">
            <Compass size={16} />
            YOUR PERSONAL TRAVEL SPACE
          </span>

          <h1>
            Welcome to Your
            <br />
            <span>Travel Profile.</span>
          </h1>

          <p>
            Your journey, your memories and your adventures
            all begin here.
          </p>

        </div>

        {/* PROFILE CARD */}

        <div className="tropical-profile-card">

          {/* PROFILE SIDEBAR */}

          <div className="tropical-profile-sidebar">

            <div className="tropical-profile-avatar">
              {initials || <User size={45} />}
            </div>

            <span className="tropical-profile-member-label">
              TRAVEL MEMBER
            </span>

            <h2>{profile.name}</h2>

            <p className="tropical-profile-email">
              <Mail size={16} />
              {profile.email}
            </p>

            <div className="tropical-profile-member-badge">
              <ShieldCheck size={17} />
              Registered User
            </div>

            <div className="tropical-profile-sidebar-divider" />

            <div className="tropical-profile-sidebar-note">
              <Compass size={25} />

              <p>
                Explore beautiful destinations.
                Create unforgettable memories.
                Travel smarter.
              </p>
            </div>

          </div>

          {/* ACCOUNT DETAILS */}

          <div className="tropical-profile-details">

            <div className="tropical-profile-details-heading">

              <div>
                <span>YOUR ACCOUNT</span>
                <h2>Personal Information</h2>
              </div>

              <div className="tropical-profile-status">
                <span />
                Account Active
              </div>

            </div>

            {/* INFORMATION CARDS */}

            <div className="tropical-profile-info-grid">

              <div className="tropical-profile-info-card">

                <div className="tropical-profile-info-icon">
                  <User size={22} />
                </div>

                <div>
                  <span>FULL NAME</span>
                  <h3>{profile.name}</h3>
                </div>

              </div>

              <div className="tropical-profile-info-card">

                <div className="tropical-profile-info-icon">
                  <Mail size={22} />
                </div>

                <div>
                  <span>EMAIL ADDRESS</span>
                  <h3>{profile.email}</h3>
                </div>

              </div>

              <div className="tropical-profile-info-card">

                <div className="tropical-profile-info-icon">
                  <Calendar size={22} />
                </div>

                <div>
                  <span>MEMBER SINCE</span>
                  <h3>{formattedDate}</h3>
                </div>

              </div>

              <div className="tropical-profile-info-card">

                <div className="tropical-profile-info-icon">
                  <ShieldCheck size={22} />
                </div>

                <div>
                  <span>USER ID</span>
                  <h3>#{profile.id}</h3>
                </div>

              </div>

            </div>

            {/* SECURITY NOTE */}

            <div className="tropical-profile-bottom-note">
              <ShieldCheck size={20} />

              <p>
                Your account information is securely displayed
                in your personal travel space.
              </p>
            </div>

            {/* BACK BUTTON */}

            <Link
              to="/home"
              className="tropical-profile-home-button"
            >
              <ArrowLeft size={18} />
              Back to Home
            </Link>

          </div>

        </div>

        {/* FOOTER MESSAGE */}

        <div className="tropical-profile-footer-note">
          <Compass size={17} />
          DISCOVER SRI LANKA · TRAVEL BEYOND EXPECTATIONS
        </div>

      </div>
    </div>
  );
}