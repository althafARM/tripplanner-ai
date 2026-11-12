import "./UserRegister.css";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import {
  Compass,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
} from "lucide-react";

function UserLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await loginUser(email, password);
      navigate("/home");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="midnight-auth-page">
      <div className="midnight-auth-wrapper">

        {/* Left Welcome Section */}
        <div className="midnight-auth-visual">
          <div className="midnight-auth-visual-overlay" />

          <Link to="/login" className="midnight-auth-brand">
            <span className="midnight-auth-brand-icon">
              <Compass size={25} />
            </span>
            <span>TripPlanner <strong>AI</strong></span>
          </Link>

          <div className="midnight-auth-visual-content">
            <span className="midnight-auth-eyebrow">
              <Sparkles size={15} />
              YOUR JOURNEY STARTS HERE
            </span>

            <h1>
              Discover the world.
              <br />
              <span>Travel your way.</span>
            </h1>

            <p>
              Explore beautiful destinations, create personalised
              itineraries, and make every journey unforgettable.
            </p>

            <div className="midnight-auth-visual-footer">
              <span className="midnight-auth-gold-line" />
              <span>Explore more. Experience more.</span>
            </div>
          </div>

          <div className="midnight-auth-image-credit">
            YOUR NEXT ADVENTURE AWAITS
          </div>
        </div>

        {/* Right Login Section */}
        <div className="midnight-auth-form-section">

          <div className="midnight-auth-form-top">
            <span>WELCOME BACK</span>
            <span className="midnight-auth-secure">
              <Lock size={13} /> Secure Login
            </span>
          </div>

          <div className="midnight-auth-form-content">

            <div className="midnight-auth-mobile-logo">
              <Compass size={30} />
            </div>

            <span className="midnight-auth-form-eyebrow">
              YOUR TRAVEL SPACE
            </span>

            <h2>
              Welcome <span>back.</span>
            </h2>

            <p className="midnight-auth-description">
              Sign in to continue your travel journey.
            </p>

            <form onSubmit={handleLogin}>

              <div className="midnight-auth-field">
                <label htmlFor="login-email">
                  Email Address
                </label>

                <div className="midnight-auth-input">
                  <Mail size={18} />

                  <input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="midnight-auth-field">
                <label htmlFor="login-password">
                  Password
                </label>

                <div className="midnight-auth-input">
                  <Lock size={18} />

                  <input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
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
                  "Signing in..."
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={19} />
                  </>
                )}
              </button>

            </form>

            <div className="midnight-auth-divider">
              <span />
              <span>NEW TO TRIPPLANNER AI?</span>
              <span />
            </div>

            <div className="midnight-auth-register">
              <p>Don't have an account?</p>

              <Link to="/register">
                Create Account <ArrowRight size={16} />
              </Link>
            </div>

          </div>

          <div className="midnight-auth-bottom">
            <span>© 2026 TripPlanner AI</span>
            <span>Plan your journey with confidence.</span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default UserLogin;
