import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext.jsx";

function Navbar() {
  const [currentTime, setCurrentTime] = useState("");
  const { theme, toggleTheme } = useTheme();

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
        <span className="admin-badge">Admin</span>
      </div>
    </div>
  );
}

export default Navbar;
