// ============================================================
// Login.jsx — Attractive Login Page with Animated Background
// ============================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { TrendingUp, AlertTriangle, Info } from "lucide-react";
import "./Login.css";

// Demo credentials (shown to user)
const DEMO_USERS = [
  { username: "demo",  password: "demo123"  },
  { username: "admin", password: "admin123" },
  { username: "trader",password: "trader123"},
];

export default function Login() {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  function handleLogin(e) {
    e.preventDefault();
    setError("");

    // Validate credentials
    const user = DEMO_USERS.find(
      (u) => u.username === username.trim().toLowerCase() && u.password === password
    );

    if (!user) {
      setError("Invalid username or password. Use the demo credentials below.");
      return;
    }

    setLoading(true);
    // Simulate brief loading
    setTimeout(() => {
      dispatch({ type: "LOGIN", payload: { username: user.username } });
      navigate("/dashboard");
    }, 800);
  }

  return (
    <div className="login-page">
      {/* Animated background */}
      <div className="login-bg">
        <div className="login-grid" />
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />
      </div>

      {/* Login card */}
      <div className="login-card">
        {/* Brand */}
        <div className="login-logo">
          <div className="login-logo-icon"><TrendingUp size={26} color="white" /></div>
          <div className="login-logo-text">
            <h1>StockVault</h1>
            <p>Virtual Trading Platform</p>
          </div>
        </div>

        {/* Heading */}
        <div className="login-heading">
          <h2>Welcome Back, Trader</h2>
          <p>Sign in to access your portfolio</p>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              id="login-username"
              className="form-input"
              type="text"
              placeholder="Enter username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="login-password"
              className="form-input"
              type="password"
              placeholder="Enter password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="login-error" style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <AlertTriangle size={15} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <button
            id="login-submit-btn"
            className="login-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In to StockVault →"}
          </button>
        </form>

        {/* Demo credentials hint */}
        <div className="login-demo-hint" style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
          <Info size={13} style={{ flexShrink: 0, color: "var(--accent)" }} />
          <span><strong>Demo:</strong> username: <strong>demo</strong> · password: <strong>demo123</strong></span>
        </div>

        {/* Stats */}
        <div className="login-stats">
          <div className="login-stat">
            <div className="login-stat-value">20</div>
            <div className="login-stat-label">Live Stocks</div>
          </div>
          <div className="login-stat">
            <div className="login-stat-value">$10K</div>
            <div className="login-stat-label">Starting Cash</div>
          </div>
          <div className="login-stat">
            <div className="login-stat-value">AI</div>
            <div className="login-stat-label">TradeBot</div>
          </div>
        </div>
      </div>
    </div>
  );
}
