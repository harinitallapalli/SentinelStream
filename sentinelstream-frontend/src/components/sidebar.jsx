import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="logo">SentinelStream</h2>

      <nav>
        <Link to="/dashboard">Dashboard</Link>

        <Link to="/transactions">
          Transactions
        </Link>

        <Link to="/alerts">
          Fraud Alerts
        </Link>

        <Link to="/analytics">
          Analytics
        </Link>

        <Link to="/">Logout</Link>
      </nav>
    </div>
  );
}

export default Sidebar;