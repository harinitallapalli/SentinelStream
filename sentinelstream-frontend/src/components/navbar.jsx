import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function Navbar() {
  const [currentTime, setCurrentTime] = useState("");
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date().toLocaleDateString([], {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="navbar">
      <div className="navbar-brand">
        <div className="navbar-title">SentinelStream Fraud Detection System</div>
        <div className="navbar-subtitle">Detect · Analyze · Prevent</div>
      </div>

      <div className="navbar-actions">
        <div className="navbar-clock">
          <span>{today}</span>
          <span>{currentTime}</span>
        </div>
        <button 
          className="icon-button" 
          type="button" 
          onClick={toggleTheme} 
          title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
          style={{ marginRight: "4px" }}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        <button className="icon-button" type="button">🔔</button>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Logged in as:</span>
          <span 
            className="admin-badge" 
            style={{ 
              background: user?.role === "Admin" ? "#ef4444" : user?.role === "Analyst" ? "#3b82f6" : "#10b981",
              padding: "6px 12px",
              fontSize: "0.85rem",
              fontWeight: "bold",
              borderRadius: "8px",
              minWidth: "80px",
              textAlign: "center"
            }}
          >
            {user?.role || "Viewer"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Navbar;

