import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="logo-block">
        <div className="logo-icon">S</div>
        <div>
          <h2 className="logo">SentinelStream</h2>
          <p className="logo-subtitle">Fraud Intelligence</p>
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

        <NavLink className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")} to="/settings">
          <span>⚙️</span>
          Platform Settings
        </NavLink>

        <NavLink className="sidebar-link" to="/">
          <span>⇦</span>
          Logout
        </NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;