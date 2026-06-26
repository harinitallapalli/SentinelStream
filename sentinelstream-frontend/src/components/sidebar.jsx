import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Sidebar() {
  const { logout, user } = useAuth();

  const getRoleColor = (role) => {
    switch (role) {
      case "Admin": return "#ef4444";
      case "Analyst": return "#3b82f6";
      case "Viewer": return "#10b981";
      default: return "#64748b";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "Admin": return "👑";
      case "Analyst": return "🔍";
      case "Viewer": return "👁️";
      default: return "👤";
    }
  };

  return (
    <div className="sidebar">
      <div className="logo-block">
        <div className="logo-icon">S</div>
        <div>
          <h2 className="logo">SentinelStream</h2>
          <p className="logo-subtitle">Fraud Intelligence</p>
        </div>
      </div>

      {/* User Role Display */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-color)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.2rem" }}>{getRoleIcon(user?.role)}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-primary)" }}>
              {user?.name || "User"}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              {user?.email}
            </div>
          </div>
          <span 
            style={{ 
              background: getRoleColor(user?.role),
              color: "white",
              padding: "4px 10px",
              borderRadius: "12px",
              fontSize: "0.7rem",
              fontWeight: "bold",
              textTransform: "uppercase"
            }}
          >
            {user?.role || "Viewer"}
          </span>
        </div>
      </div>

      <nav>
        <NavLink className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")} to="/dashboard">
          <span>📊</span>
          Dashboard
        </NavLink>

        <NavLink className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")} to="/transactions">
          <span>💳</span>
          Transactions
        </NavLink>

        <NavLink className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")} to="/alerts">
          <span>🚨</span>
          Fraud Alerts
        </NavLink>

        <NavLink className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")} to="/analytics">
          <span>📈</span>
          Analytics
        </NavLink>

        <NavLink className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")} to="/map">
          <span>🌐</span>
          Global Map
        </NavLink>

        <NavLink className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")} to="/reports">
          <span>📄</span>
          System Reports
        </NavLink>

        {user?.role === "Admin" && (
          <NavLink className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")} to="/settings">
            <span>⚙️</span>
            Platform Settings
          </NavLink>
        )}

        <NavLink className="sidebar-link" to="/" onClick={logout}>
          <span>⇦</span>
          Logout
        </NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;