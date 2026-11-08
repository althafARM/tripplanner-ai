
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
      <div className="midnight-profile-loading">
        <Loader2 size={38} className="midnight-profile-spinner" />
        <h3>Loading your profile</h3>
        <p>Please wait while we retrieve your account information.</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="midnight-profile-error-page">
        <div className="midnight-profile-error-card">
          <ShieldCheck size={38} />
          <h2>Profile unavailable</h2>
          <p>{error || "Profile information not available."}</p>
          <Link to="/home" className="midnight-profile-back-button">
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
    <div className="midnight-profile-page">
      <div className="midnight-profile-container">

        {/* Page Heading */}
        <div className="midnight-profile-heading">
          <span className="midnight-profile-eyebrow">
            YOUR PERSONAL SPACE
          </span>

          <h1>
            My <span>Profile.</span>
          </h1>

          <p>
            View your personal information and account details.
          </p>
        </div>

        {/* Profile Overview */}
        <div className="midnight-profile-layout">

          <div className="midnight-profile-sidebar">
            <div className="midnight-profile-avatar">
              {initials || <User size={45} />}
            </div>

            <h2>{profile.name}</h2>

            <p className="midnight-profile-email">
              <Mail size={15} />
              {profile.email}
            </p>

            <div className="midnight-profile-member-badge">
              <ShieldCheck size={16} />
              Registered User
            </div>

            <div className="midnight-profile-sidebar-divider" />

            <div className="midnight-profile-sidebar-note">
              <Compass size={21} />
              <p>
                Your next adventure is just a plan away.
              </p>
            </div>
          </div>

          {/* Account Information */}
          <div className="midnight-profile-details">

            <div className="midnight-profile-details-heading">
              <div>
                <span>ACCOUNT INFORMATION</span>
                <h2>Personal Details</h2>
              </div>

              <div className="midnight-profile-status">
                <span />
                Account Active
              </div>
            </div>

            <div className="midnight-profile-info-grid">

              <div className="midnight-profile-info-card">
                <div className="midnight-profile-info-icon">
                  <User size={21} />
                </div>

                <div>
                  <span>FULL NAME</span>
                  <h3>{profile.name}</h3>
                </div>
              </div>

              <div className="midnight-profile-info-card">
                <div className="midnight-profile-info-icon">
                  <Mail size={21} />
                </div>

                <div>
                  <span>EMAIL ADDRESS</span>
                  <h3>{profile.email}</h3>
                </div>
              </div>

              <div className="midnight-profile-info-card">
                <div className="midnight-profile-info-icon">
                  <Calendar size={21} />
                </div>

                <div>
                  <span>ACCOUNT CREATED</span>
                  <h3>{formattedDate}</h3>
                </div>
              </div>

              <div className="midnight-profile-info-card">
                <div className="midnight-profile-info-icon">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <span>USER ID</span>
                  <h3>#{profile.id}</h3>
                </div>
              </div>

            </div>

            <div className="midnight-profile-bottom-note">
              <ShieldCheck size={18} />
              <p>
                Your account information is securely displayed
                in your personal travel space.
              </p>
            </div>

            <Link
              to="/home"
              className="midnight-profile-home-button"
            >
              <ArrowLeft size={17} />
              Back to Home
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}
