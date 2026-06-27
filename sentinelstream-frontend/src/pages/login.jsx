import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left-panel">
        <div className="login-branding">
          <div className="login-logo-badge">S</div>
          <span className="login-brand-text">SentinelStream</span>
        </div>

        <div className="login-hero-text">
          <h1 className="login-hero-title">Real-time fraud intelligence for modern finance.</h1>
          <p className="login-hero-subtitle">
            Monitor every transaction, score risk in milliseconds, and stop fraud before it lands on the books.
          </p>
        </div>

        <div className="login-stats-row">
          <div className="login-stat-card login-stat-card-primary">
            <div className="login-stat-value">99.7%</div>
            <div className="login-stat-label">DETECTION RATE</div>
          </div>
          <div className="login-stat-card login-stat-card-primary">
            <div className="login-stat-value">&lt;50ms</div>
            <div className="login-stat-label">DECISION TIME</div>
          </div>
          <div className="login-stat-card login-stat-card-primary">
            <div className="login-stat-value">24/7</div>
            <div className="login-stat-label">MONITORING</div>
          </div>
        </div>
      </div>

      <div className="login-right-panel">
        <form className="login-form-card" onSubmit={handleLogin}>
          <div className="login-form-header">
            <h2 className="login-form-title">Sign in to your console</h2>
            <p className="login-form-subtitle">Access fraud alerts, transactions and analytics.</p>
          </div>

          {error && (
            <div className="login-error-message">
              {error}
            </div>
          )}

          <label className="login-label">
            Email
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="login-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="login-label">
            Password
            <input 
              type="password" 
              placeholder="Enter your password" 
              className="login-input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button 
            type="submit" 
            className="login-submit-btn"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="login-footer">
            Don&apos;t have an account? <Link to="/register" className="login-link">Register</Link>
          </p>

          <div className="login-demo-credentials">
            <p className="login-demo-title">Demo Credentials:</p>
            <div className="login-demo-item">
              <strong>Admin:</strong> admin@sentinelstream.com / Admin123!
            </div>
            <div className="login-demo-item">
              <strong>Analyst:</strong> analyst@sentinelstream.com / Analyst123!
            </div>
            <div className="login-demo-item">
              <strong>Viewer:</strong> viewer@sentinelstream.com / Viewer123!
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
