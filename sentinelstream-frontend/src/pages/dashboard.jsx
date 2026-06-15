import { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function Dashboard() {
  const [stats, setStats] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [location, setLocation] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const loadData = async () => {
    try {
      const [statsRes, transactionsRes, alertsRes] =
        await Promise.all([
          axios.get("http://127.0.0.1:8000/stats/"),
          axios.get("http://127.0.0.1:8000/transactions/"),
          axios.get("http://127.0.0.1:8000/alerts/"),
        ]);

      setStats(statsRes.data);
      setTransactions(transactionsRes.data);
      setAlerts(alertsRes.data);
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

      alert("Transaction Created Successfully");
    } catch (error) {
      console.log(error.response?.data || error);
      alert(
        JSON.stringify(
          error.response?.data || "Transaction Failed"
        )
      );
    }
  };

  const pieData = [
    { name: "SAFE", value: stats.safe_transactions || 0 },
    { name: "FRAUD", value: stats.fraud_transactions || 0 },
    { name: "HIGH_RISK", value: stats.high_risk_transactions || 0 },
  ];

  const barData = [
    {
      name: "Transactions",
      SAFE: stats.safe_transactions || 0,
      FRAUD: stats.fraud_transactions || 0,
      HIGH_RISK: stats.high_risk_transactions || 0,
    },
  ];

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.location?.toLowerCase().includes(search.toLowerCase()) ||
      t.id?.toString().includes(search);

    const matchesFilter =
      filter === "ALL" ? true : t.status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        <Navbar />

        <h1
          style={{
            textAlign: "center",
            marginBottom: "30px",
            fontSize: "48px",
            fontWeight: "bold",
          }}
        >
          SentinelStream Dashboard
        </h1>

        {/* STATS CARD */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3 className="text-gray-500">
              Total Transactions
            </h3>
            <p className="text-3xl font-bold">
              {stats.total_transactions || 0}
            </p>
          </div>
        </div>

        {/* CHARTS */}
        <div className="chart-grid">
          <div className="chart-card">
            <h2 className="text-2xl font-bold mb-4">
              Risk Distribution
            </h2>

            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  outerRadius={120}
                  label
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#eab308" />
                  <Cell fill="#dc2626" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h2 className="text-2xl font-bold mb-4">
              Transaction Statistics
            </h2>

            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Bar dataKey="SAFE" fill="#22c55e" />
                <Bar dataKey="FRAUD" fill="#eab308" />
                <Bar dataKey="HIGH_RISK" fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CREATE TRANSACTION */}
        <div className="form-card">
          <h2 className="text-2xl font-bold mb-5">
            Create Transaction
          </h2>

          <form onSubmit={createTransaction} className="form-grid">
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

            <button type="submit">Create</button>
          </form>
        </div>

        {/* SEARCH + FILTER */}
        <div className="mt-10 flex gap-4">
          <input
            type="text"
            placeholder="Search by ID or Location"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-3 rounded w-80"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border p-3 rounded"
          >
            <option value="ALL">ALL</option>
            <option value="SAFE">SAFE</option>
            <option value="FRAUD">FRAUD</option>
            <option value="HIGH_RISK">HIGH_RISK</option>
          </select>
        </div>

        {/* TRANSACTIONS TABLE */}
        <div className="table-card">
          <h2 className="text-2xl font-bold mb-5">
            Transactions
          </h2>

          <table className="w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>User ID</th>
                <th>Amount</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredTransactions.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.user_id}</td>
                  <td>₹{t.amount}</td>
                  <td>{t.location}</td>
                  <td>{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ALERTS */}
        <div className="table-card">
          <h2 className="text-2xl font-bold mb-5">
            Fraud Alerts
          </h2>

          <table className="w-full">
            <thead>
              <tr>
                <th>Alert ID</th>
                <th>Transaction ID</th>
                <th>Reason</th>
              </tr>
            </thead>

            <tbody>
              {alerts.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{a.transaction_id}</td>
                  <td>{a.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;