
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  User,
  LogIn,
  ShieldCheck,
  ArrowRight,
  Compass,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed.");
      }

      sessionStorage.setItem("admin_token", data.access_token);

      navigate("/monitoring");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="midnight-admin-login">

      {/* Left information panel */}
      <div className="midnight-admin-visual">
        <div className="midnight-admin-brand">
          <span><Compass size={26} /></span>
          <div>
            TripPlanner <b>AI</b>
            <small>ADMINISTRATION PORTAL</small>
          </div>
        </div>

        <div className="midnight-admin-visual-content">
          <span className="midnight-admin-label">
            <ShieldCheck size={16} />
            SECURE ADMIN ACCESS
          </span>

          <h1>
            Manage your platform.
            <br />
            <em>Monitor every journey.</em>
          </h1>

          <p>
            Access your TripPlanner AI administration dashboard
            to monitor system performance, manage users and
            oversee platform activities.
          </p>

          <div className="midnight-admin-visual-footer">
            <span className="midnight-admin-dot" />
            Secure administrator environment
          </div>
        </div>

        <div className="midnight-admin-decoration">TP</div>
      </div>

      {/* Right login panel */}
      <div className="midnight-admin-form-area">
        <div className="midnight-admin-login-card">

          <div className="midnight-admin-icon">
            <Lock size={27} />
          </div>

          <span className="midnight-admin-welcome">
            WELCOME BACK
          </span>

          <h2>Admin Login</h2>

          <p className="midnight-admin-description">
            Sign in to access your monitoring dashboard.
          </p>

          <form onSubmit={handleLogin}>

            <label htmlFor="admin-username">Username</label>

            <div className="midnight-admin-input">
              <User size={19} />

              <input
                id="admin-username"
                type="text"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <label htmlFor="admin-password">Password</label>

            <div className="midnight-admin-input">
              <Lock size={19} />

              <input
                id="admin-password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="midnight-admin-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="midnight-admin-submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight size={19} />}
              {loading && <LogIn size={18} />}
            </button>

          </form>

          <div className="midnight-admin-security">
            <ShieldCheck size={17} />
            Protected administrator access
          </div>

          <div className="midnight-admin-copyright">
            © {new Date().getFullYear()} TripPlanner AI. All rights reserved.
          </div>

        </div>
      </div>

    </div>
  );
}

export default AdminLogin;
