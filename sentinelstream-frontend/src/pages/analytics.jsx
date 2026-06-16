import { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function Analytics() {
  const [stats, setStats] = useState({});
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, alertsRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/stats/"),
          axios.get("http://127.0.0.1:8000/alerts/"),
        ]);
        setStats(statsRes.data || {});
        setAlerts(alertsRes.data || []);
      } catch (error) {
        console.error(error);
      }
    };
    loadData();
  }, []);

  const pieData = [
    { name: "Safe", value: stats.safe_transactions || 0 },
    { name: "Fraud", value: stats.fraud_transactions || 0 },
    { name: "High Risk", value: stats.high_risk_transactions || 0 },
  ];

  const total = stats.total_transactions || 0;
  const fraudPercent = typeof stats.fraud_rate === "string"
    ? parseFloat(stats.fraud_rate.replace("%", "")) || 0
    : stats.fraud_rate || (total ? ((stats.fraud_transactions || 0) / total) * 100 : 0);
  const averageAmount = total ? ((stats.total_amount_processed || 0) / total).toFixed(2) : 0;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />

        <div className="page-header">
          <div>
            <h1>Analytics</h1>
            <p>Fraud trends, insights, and distribution in one place.</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card blue">
            <span className="stat-label">Total Transactions</span>
            <strong>{total}</strong>
          </div>
          <div className="stat-card green">
            <span className="stat-label">Safe Transactions</span>
            <strong>{stats.safe_transactions || 0}</strong>
          </div>
          <div className="stat-card red">
            <span className="stat-label">Fraud Transactions</span>
            <strong>{stats.fraud_transactions || 0}</strong>
          </div>
          <div className="stat-card purple">
            <span className="stat-label">Fraud Rate</span>
            <strong>{fraudPercent.toFixed(1)}%</strong>
          </div>
        </div>

        <div className="dashboard-row">
          <div className="chart-card">
            <div className="chart-card-header">
              <h2>Risk Distribution</h2>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={120} label>
                  <Cell fill="#22c55e" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="table-card analytics-metrics">
            <div className="chart-card-header">
              <h2>Key Metrics</h2>
            </div>
            <ul className="insight-list">
              <li>
                <span>Total amount processed</span>
                <strong>₹{stats.total_amount_processed || 0}</strong>
              </li>
              <li>
                <span>Average ticket value</span>
                <strong>₹{averageAmount}</strong>
              </li>
              <li>
                <span>Alerts generated</span>
                <strong>{alerts.length}</strong>
              </li>
            </ul>
          </div>
        </div>

        <div className="table-card">
          <h2>Recent Fraud Alerts</h2>
          <table>
            <thead>
              <tr>
                <th>Alert</th>
                <th>Transaction</th>
                <th>Reason</th>
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
                    <td>{alert.resolved ? "Resolved" : "Open"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-state-row">
                    No alerts available yet.
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

export default Analytics;
