import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div style={{ padding: "40px" }}>
      <h1>SentinelStream Dashboard</h1>

      <br />

      <Link to="/transactions">
        <button>Transactions</button>
      </Link>

      <br />
      <br />

      <Link to="/alerts">
        <button>Alerts</button>
      </Link>

      <br />
      <br />

      <Link to="/analytics">
        <button>Analytics</button>
      </Link>

      <br />
      <br />

      <Link to="/">
        <button>Logout</button>
      </Link>
    </div>
  );
}

export default Dashboard;