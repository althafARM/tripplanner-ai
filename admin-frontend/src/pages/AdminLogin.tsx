import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, LogIn, Compass } from "lucide-react";
import { adminLogin } from "../services/adminService";

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
      await adminLogin(username, password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-brand">
          <div className="brand-icon">
            <Compass size={28} />
          </div>

          <h2>TripPlanner AI</h2>
        </div>

        <div className="login-heading">
          <div className="login-icon">
            <Lock size={25} />
          </div>

          <h1>Admin Login</h1>

          <p>
            Welcome back! Sign in to manage your travel
            platform.
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <label>Username</label>

          <div className="input-group">
            <User size={18} />

            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <label>Password</label>

          <div className="input-group">
            <Lock size={18} />

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}>
            <LogIn size={18} />

            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="login-footer">
          TripPlanner AI · Administration Portal
        </div>

      </div>
    </div>
  );
}

export default AdminLogin;