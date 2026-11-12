import "./UserRegister.css";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Compass,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { registerUser } from "../services/authService";

function UserRegister() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await registerUser(name, email, password);

      navigate("/login", {
        state: {
          message: "Account created successfully! Please sign in.",
        },
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="midnight-auth-page">
      <div className="midnight-auth-wrapper midnight-register-wrapper">

        {/* Left Welcome Section */}
        <div className="midnight-auth-visual midnight-register-visual">

          <div className="midnight-auth-visual-overlay" />

          <Link to="/login" className="midnight-auth-brand">
            <span className="midnight-auth-brand-icon">
              <Compass size={25} />
            </span>
            <span>
              TripPlanner <strong>AI</strong>
            </span>
          </Link>

          <div className="midnight-auth-visual-content">
            <span className="midnight-auth-eyebrow">
              <Sparkles size={15} />
              START YOUR ADVENTURE
            </span>

            <h1>
              Every journey
              <br />
              begins with <span>you.</span>
            </h1>

            <p>
              Create your account and discover amazing destinations,
              personalised travel plans, and unforgettable experiences.
            </p>

            <div className="midnight-register-benefits">

              <div>
                <ShieldCheck size={18} />
                <span>Your personal travel space</span>
              </div>

              <div>
                <Compass size={18} />
                <span>Discover exciting destinations</span>
              </div>

              <div>
                <Sparkles size={18} />
                <span>AI-powered trip planning</span>
              </div>

            </div>

            <div className="midnight-auth-visual-footer">
              <span className="midnight-auth-gold-line" />
              <span>Your journey. Your memories.</span>
            </div>
          </div>

          <div className="midnight-auth-image-credit">
            YOUR NEXT ADVENTURE AWAITS
          </div>
        </div>

        {/* Right Registration Section */}
        <div className="midnight-auth-form-section midnight-register-form-section">

          <div className="midnight-auth-form-top">
            <span>CREATE YOUR ACCOUNT</span>

            <span className="midnight-auth-secure">
              <Lock size={13} />
              Secure Registration
            </span>
          </div>

          <div className="midnight-auth-form-content">

            <div className="midnight-auth-mobile-logo">
              <Compass size={30} />
            </div>

            <span className="midnight-auth-form-eyebrow">
              JOIN TRIPPLANNER AI
            </span>

            <h2>
              Create <span>account.</span>
            </h2>

            <p className="midnight-auth-description">
              Sign up and start planning your next journey.
            </p>

            <form onSubmit={handleRegister}>

              {/* Full Name */}
              <div className="midnight-auth-field">
                <label htmlFor="register-name">
                  Full Name
                </label>

                <div className="midnight-auth-input">
                  <User size={18} />

                  <input
                    id="register-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="midnight-auth-field">
                <label htmlFor="register-email">
                  Email Address
                </label>

                <div className="midnight-auth-input">
                  <Mail size={18} />

                  <input
                    id="register-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="midnight-auth-field">
                <label htmlFor="register-password">
                  Password
                </label>

                <div className="midnight-auth-input">
                  <Lock size={18} />

                  <input
                    id="register-password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    maxLength={128}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="midnight-auth-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="midnight-auth-submit"
                disabled={loading}
              >
                {loading ? (
                  "Creating Account..."
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={19} />
                  </>
                )}
              </button>

            </form>

            <div className="midnight-auth-divider">
              <span />
              <span>ALREADY A MEMBER?</span>
              <span />
            </div>

            <div className="midnight-auth-register">
              <p>Already have an account?</p>

              <Link to="/login">
                Sign In <ArrowRight size={16} />
              </Link>
            </div>

          </div>

          <div className="midnight-auth-bottom">
            <span>© 2026 TripPlanner AI</span>
            <span>Start exploring the world.</span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default UserRegister;
