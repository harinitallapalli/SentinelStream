import { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function Dashboard() {
  const [stats, setStats] = useState({});
  const [dashboardOverview, setDashboardOverview] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [location, setLocation] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const loadData = async () => {
    try {
      const [dashboardRes, statsRes, transactionsRes, alertsRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/dashboard/"),
        axios.get("http://127.0.0.1:8000/stats/"),
        axios.get("http://127.0.0.1:8000/transactions/"),
        axios.get("http://127.0.0.1:8000/alerts/"),
      ]);

      setDashboardOverview(dashboardRes.data || {});
      setStats(statsRes.data || {});
      setTransactions(transactionsRes.data || []);
      setAlerts(alertsRes.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createTransaction = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/transactions/", {
        user_id: Number(userId),
        amount: Number(amount),
        location,
      });
      setUserId("");
      setAmount("");
      setLocation("");
      await loadData();
      alert("Transaction created successfully.");
    } catch (error) {
      console.error(error);
      const message =
        error.response?.data?.detail ||
        error.response?.data ||
        error.message ||
        "Failed to create transaction.";
      alert(`Failed to create transaction: ${JSON.stringify(message)}`);
    }
  };

  const pieData = [
    { name: "Safe", value: stats.safe_transactions || 0 },
    { name: "Fraud", value: stats.fraud_transactions || 0 },
    { name: "High Risk", value: stats.high_risk_transactions || 0 },
  ];

  const barData = [
    {
      name: "Volume",
      Safe: stats.safe_transactions || 0,
      Fraud: stats.fraud_transactions || 0,
      HighRisk: stats.high_risk_transactions || 0,
    },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    const query = search.toLowerCase();
    const matchesSearch =
      transaction.id?.toString().includes(query) ||
      transaction.user_id?.toString().includes(query) ||
      transaction.location?.toLowerCase().includes(query);
    const matchesFilter = filter === "ALL" ? true : transaction.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />

        <div className="dashboard-header">
          <div>
            <p className="eyebrow">SentinelStream Fraud Detection System</p>
            <h1>Dashboard</h1>
            <p className="page-description">Real-time monitoring, alerts, and transaction analytics in one central console.</p>
          </div>
          <div className="dashboard-actions">
            <button className="btn btn-secondary">Export Data</button>
            <button className="btn btn-primary" type="button" onClick={loadData}>Refresh</button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card blue">
            <span className="stat-label">Total Users</span>
            <strong>{dashboardOverview.total_users || 0}</strong>
            <span className="stat-caption">Platform users registered</span>
          </div>
          <div className="stat-card green">
            <span className="stat-label">Safe Transactions</span>
            <strong>{stats.safe_transactions || 0}</strong>
            <span className="stat-caption">Verified safe volume</span>
          </div>
          <div className="stat-card red">
            <span className="stat-label">Fraud Transactions</span>
            <strong>{stats.fraud_transactions || 0}</strong>
            <span className="stat-caption">Detected suspicious activity</span>
          </div>
          <div className="stat-card purple">
            <span className="stat-label">Fraud Alerts</span>
            <strong>{dashboardOverview.fraud_alerts || alerts.length || 0}</strong>
            <span className="stat-caption">Alerts created from fraud events</span>
          </div>
          <div className="stat-card yellow">
            <span className="stat-label">Fraud Rate</span>
            <strong>{stats.fraud_rate || "0%"}</strong>
            <span className="stat-caption">System fraud rate</span>
          </div>
        </div>

        <div className="dashboard-row">
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <h2>Risk Distribution</h2>
                <p>Safe, fraud and high-risk transaction shares.</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={120} label>
                  <Cell fill="#22c55e" />
                  <Cell fill="#ef4444" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <h2>Transaction Statistics</h2>
                <p>Volume by risk category for the current period.</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={barData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Safe" fill="#22c55e" />
                <Bar dataKey="Fraud" fill="#ef4444" />
                <Bar dataKey="HighRisk" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel-grid">
          <div className="table-card">
            <div className="table-card-header">
              <h2>Recent Transactions</h2>
              <div className="table-actions">
                <input
                  type="text"
                  placeholder="Search by transaction ID or location"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <option value="ALL">ALL</option>
                  <option value="SAFE">SAFE</option>
                  <option value="FRAUD">FRAUD</option>
                  <option value="HIGH_RISK">HIGH_RISK</option>
                </select>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User ID</th>
                  <th>Amount</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{transaction.id}</td>
                      <td>{transaction.user_id}</td>
                      <td>₹{transaction.amount}</td>
                      <td>{transaction.location}</td>
                      <td>
                        <span className={`status ${transaction.status?.toLowerCase()}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td>{transaction.timestamp || transaction.date || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-state-row">
                      No transactions match this search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-card alert-panel">
            <div className="table-card-header">
              <h2>Recent Fraud Alerts</h2>
            </div>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Transaction</th>
                  <th>Reason</th>
                  <th>Priority</th>
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="empty-state-row">
                      No alerts found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="form-card create-transaction-card">
          <h2>Create Transaction</h2>
          <form onSubmit={createTransaction} className="create-form">
            <input
              type="number"
              placeholder="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary">Create Transaction</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
