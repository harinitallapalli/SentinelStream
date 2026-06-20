import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Analyst");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    const result = await register(name, email, password, role);
    setLoading(false);
    if (result.success) {
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } else {
      setError(result.error);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.leftPanel}>
        <div style={styles.branding}>
          <div style={styles.logoBadge}>S</div>
          <span style={styles.brandText}>SentinelStream</span>
        </div>

        <div style={styles.heroText}>
          <h1 style={styles.heroTitle}>Secure onboarding for your fraud operations.</h1>
          <p style={styles.heroSubtitle}>
            Create your account and get instant access to alerts, transactions, and analytics in a modern fraud console.
          </p>
        </div>

        <div style={styles.statsRow}>
          <div style={{ ...styles.statCard, ...styles.statCardPrimary }}>
            <div style={styles.statValue}>99.7%</div>
            <div style={styles.statLabel}>DETECTION RATE</div>
          </div>
          <div style={{ ...styles.statCard, ...styles.statCardPrimary }}>
            <div style={styles.statValue}>&lt;50ms</div>
            <div style={styles.statLabel}>DECISION TIME</div>
          </div>
          <div style={{ ...styles.statCard, ...styles.statCardPrimary }}>
            <div style={styles.statValue}>24/7</div>
            <div style={styles.statLabel}>MONITORING</div>
          </div>
        </div>
      </div>

      <div style={styles.rightPanel}>
        <form style={styles.formCard} onSubmit={handleRegister}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Create your account</h2>
            <p style={styles.formSubtitle}>Start a secure fraud monitoring experience for your team.</p>
          </div>

          {error && (
            <div style={{ padding: "12px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "10px", color: "#ef4444", fontSize: "0.9rem", marginBottom: "18px" }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ padding: "12px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "10px", color: "#16a34a", fontSize: "0.9rem", marginBottom: "18px" }}>
              {success}
            </div>
          )}

          <label style={styles.label}>
            Full name
            <input 
              type="text" 
              placeholder="Enter your full name" 
              style={styles.input} 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label style={styles.label}>
            Email
            <input 
              type="email" 
              placeholder="Enter your email" 
              style={styles.input} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label style={styles.label}>
            Password
            <input 
              type="password" 
              placeholder="Create a password" 
              style={styles.input} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <label style={styles.label}>
            Console Role
            <select 
              style={{ ...styles.input, background: "white", cursor: "pointer" }} 
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Viewer">Viewer (Read-Only Console)</option>
              <option value="Analyst">Analyst (Resolve Alerts, Add Tx)</option>
              <option value="Admin">Admin (Full access, Edit settings)</option>
            </select>
          </label>

          <button 
            type="submit" 
            style={{ ...styles.signinButton, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>

          <p style={styles.linkText}>
            Already have an account? <Link to="/" style={styles.link}>Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}


const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    background: "#eef2ff",
    fontFamily: "'Segoe UI', sans-serif",
  },
  leftPanel: {
    flex: 1,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "60px",
    background: "linear-gradient(135deg, #020617 0%, #091a3d 45%, #111b40 100%)",
    color: "white",
  },
  branding: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "48px",
  },
  logoBadge: {
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.14)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: "20px",
    color: "white",
    boxShadow: "0 20px 80px rgba(0,0,0,0.2)",
  },
  brandText: {
    fontSize: "20px",
    fontWeight: 700,
    letterSpacing: "0.04em",
  },
  heroText: {
    maxWidth: "520px",
    marginBottom: "48px",
  },
  heroTitle: {
    fontSize: "3rem",
    lineHeight: 1.05,
    marginBottom: "24px",
    maxWidth: "620px",
  },
  heroSubtitle: {
    fontSize: "1rem",
    lineHeight: 1.8,
    color: "rgba(255,255,255,0.78)",
    maxWidth: "520px",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "18px",
    maxWidth: "760px",
  },
  statCard: {
    padding: "24px 22px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(18px)",
    color: "white",
    minWidth: "140px",
  },
  statCardPrimary: {
    border: "1px solid rgba(255,255,255,0.12)",
  },
  statValue: {
    fontSize: "1.8rem",
    fontWeight: 700,
    marginBottom: "12px",
  },
  statLabel: {
    fontSize: "0.78rem",
    color: "rgba(255,255,255,0.75)",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  rightPanel: {
    width: "480px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px",
  },
  formCard: {
    width: "100%",
    background: "white",
    borderRadius: "28px",
    padding: "40px",
    boxShadow: "0 40px 120px rgba(15, 23, 42, 0.15)",
  },
  formHeader: {
    marginBottom: "28px",
  },
  formTitle: {
    fontSize: "1.9rem",
    marginBottom: "10px",
    color: "#111827",
  },
  formSubtitle: {
    color: "#6b7280",
    lineHeight: 1.7,
  },
  label: {
    display: "block",
    marginBottom: "18px",
    fontSize: "0.95rem",
    color: "#374151",
  },
  input: {
    width: "100%",
    marginTop: "10px",
    borderRadius: "16px",
    border: "1px solid #d1d5db",
    padding: "14px 16px",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color 0.2s ease",
  },
  signinButton: {
    width: "100%",
    background: "linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)",
    border: "none",
    borderRadius: "16px",
    color: "white",
    padding: "14px 16px",
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "10px",
    boxShadow: "0 20px 40px rgba(59, 130, 246, 0.18)",
  },
  linkText: {
    marginTop: "22px",
    color: "#6b7280",
    textAlign: "center",
    fontSize: "0.95rem",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: 700,
  },
};

export default Register;