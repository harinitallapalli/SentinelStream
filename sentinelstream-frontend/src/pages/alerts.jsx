import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function Alerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/alerts/");
        setAlerts(response.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    loadAlerts();
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />

        <div className="page-header">
          <div>
            <h1>Fraud Alerts</h1>
            <p>Review high-risk alerts and act on suspicious transactions.</p>
          </div>
          <button className="btn btn-primary">Resolve Selected</button>
        </div>

        <div className="stats-grid">
          <div className="stat-card blue">
            <span className="stat-label">Total Alerts</span>
            <strong>{alerts.length}</strong>
          </div>
          <div className="stat-card red">
            <span className="stat-label">Pending</span>
            <strong>{alerts.filter((alert) => !alert.resolved).length}</strong>
          </div>
          <div className="stat-card yellow">
            <span className="stat-label">High Priority</span>
            <strong>{alerts.filter((alert) => alert.priority === "HIGH").length}</strong>
          </div>
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Transaction</th>
                <th>Reason</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <tr key={alert.id}>
                    <td>{alert.id}</td>
                    <td>{alert.transaction_id}</td>
                    <td>{alert.reason}</td>
                    <td>{alert.priority || "MEDIUM"}</td>
                    <td>{alert.resolved ? "Resolved" : "Open"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-state-row">
                    No fraud alerts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Alerts;
