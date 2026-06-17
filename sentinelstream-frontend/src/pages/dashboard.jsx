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
  AreaChart,
  Area,
} from "recharts";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import TransactionDetailsModal from "../components/TransactionDetailsModal";
import { generatePDFReport } from "../utils/pdfGenerator";

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

  // New States
  const [trendData, setTrendData] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(10); // Default to 10s

  const loadData = async () => {
    try {
      const [dashboardRes, statsRes, transactionsRes, alertsRes, trendRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/dashboard/"),
        axios.get("http://127.0.0.1:8000/stats/"),
        axios.get("http://127.0.0.1:8000/transactions/"),
        axios.get("http://127.0.0.1:8000/alerts/"),
        axios.get("http://127.0.0.1:8000/stats/trend/"),
      ]);

      setDashboardOverview(dashboardRes.data || {});
      setStats(statsRes.data || {});
      setTransactions(transactionsRes.data || []);
      setAlerts(alertsRes.data || []);
      setTrendData(trendRes.data || []);

      // Update currently open details modal transaction if it exists
      if (selectedTransaction) {
        const updatedTx = (transactionsRes.data || []).find(t => t.id === selectedTransaction.id);
        if (updatedTx) setSelectedTransaction(updatedTx);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (refreshInterval === 0) return;
    const interval = setInterval(() => {
      loadData();
    }, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [refreshInterval, selectedTransaction]);

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
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "white", padding: "8px 12px", borderRadius: "16px", border: "1px solid #e2e8f0" }} className="dark-mode-card-nested">
              <span className="live-dot-container" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span className={`live-dot ${refreshInterval > 0 ? "active" : ""}`} style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: refreshInterval > 0 ? "#10b981" : "#94a3b8",
                  display: "inline-block",
                  boxShadow: refreshInterval > 0 ? "0 0 8px #10b981" : "none",
                  animation: refreshInterval > 0 ? "pulse 1.5s infinite" : "none"
                }}></span>
                <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Auto Refresh:</span>
              </span>
              <select 
                value={refreshInterval} 
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                style={{ border: "none", background: "transparent", fontSize: "0.85rem", fontWeight: "bold", padding: "0 4px", cursor: "pointer", color: "#0f172a" }}
              >
                <option value="0">Off</option>
                <option value="5">5s</option>
                <option value="10">10s</option>
                <option value="30">30s</option>
                <option value="60">60s</option>
              </select>
            </div>
            <button className="btn btn-secondary" onClick={() => generatePDFReport(transactions, stats)}>Export PDF</button>
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

        <div className="dashboard-row" style={{ gridTemplateColumns: "1fr" }}>
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <h2>Fraud & Risk Volume Trend</h2>
                <p>Safe, fraud and high-risk transaction trends over the last 7 days.</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorHighRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="Safe" stroke="#22c55e" fillOpacity={1} fill="url(#colorSafe)" />
                <Area type="monotone" dataKey="Fraud" stroke="#ef4444" fillOpacity={1} fill="url(#colorFraud)" />
                <Area type="monotone" dataKey="HighRisk" stroke="#f59e0b" fillOpacity={1} fill="url(#colorHighRisk)" />
              </AreaChart>
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
                    <tr 
                      key={transaction.id} 
                      onClick={() => setSelectedTransaction(transaction)} 
                      style={{ cursor: "pointer" }}
                      title="Click to view details"
                    >
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
                    <tr 
                      key={alert.id}
                      onClick={() => {
                        const tx = transactions.find((t) => t.id === alert.transaction_id);
                        if (tx) setSelectedTransaction(tx);
                      }}
                      style={{ cursor: "pointer" }}
                      title="Click to view transaction details"
                    >
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

        {selectedTransaction && (
          <TransactionDetailsModal
            transaction={selectedTransaction}
            alertItem={alerts.find((a) => a.transaction_id === selectedTransaction.id)}
            onClose={() => setSelectedTransaction(null)}
            onUpdate={loadData}
          />
        )}
      </div>
    </div>
  );
}

export default Dashboard;
