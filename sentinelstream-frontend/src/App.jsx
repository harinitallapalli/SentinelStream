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

function App() {
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
      const statsRes = await axios.get(
        "http://127.0.0.1:8000/stats/"
      );

      const transactionsRes = await axios.get(
        "http://127.0.0.1:8000/transactions/"
      );

      const alertsRes = await axios.get(
        "http://127.0.0.1:8000/alerts/"
      );

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
      await axios.post(
        "http://127.0.0.1:8000/transactions/",
        {
          user_id: Number(userId),
          amount: Number(amount),
          location,
        }
      );

      setUserId("");
      setAmount("");
      setLocation("");

      await loadData();

      alert("Transaction Created Successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to create transaction");
    }
  };

  const pieData = [
    {
      name: "SAFE",
      value: stats.safe_transactions || 0,
    },
    {
      name: "FRAUD",
      value: stats.fraud_transactions || 0,
    },
    {
      name: "HIGH_RISK",
      value: stats.high_risk_transactions || 0,
    },
  ];

  const barData = [
    {
      name: "Transactions",
      SAFE: stats.safe_transactions || 0,
      FRAUD: stats.fraud_transactions || 0,
      HIGH_RISK: stats.high_risk_transactions || 0,
    },
  ];

  const filteredTransactions = transactions.filter(
    (transaction) => {
      const matchesSearch =
        transaction.location
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        transaction.id
          .toString()
          .includes(search);

      const matchesFilter =
        filter === "ALL"
          ? true
          : transaction.status === filter;

      return matchesSearch && matchesFilter;
    }
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-5xl font-bold text-center mb-10">
        SentinelStream Dashboard
      </h1>

      {/* DASHBOARD CARDS */}
      <div className="grid grid-cols-5 gap-5">
        <div className="bg-blue-500 text-white p-6 rounded-xl shadow">
          <h2>Total Transactions</h2>
          <p className="text-4xl font-bold">
            {stats.total_transactions}
          </p>
        </div>

        <div className="bg-green-500 text-white p-6 rounded-xl shadow">
          <h2>SAFE</h2>
          <p className="text-4xl font-bold">
            {stats.safe_transactions}
          </p>
        </div>

        <div className="bg-yellow-500 text-white p-6 rounded-xl shadow">
          <h2>FRAUD</h2>
          <p className="text-4xl font-bold">
            {stats.fraud_transactions}
          </p>
        </div>

        <div className="bg-red-600 text-white p-6 rounded-xl shadow">
          <h2>HIGH RISK</h2>
          <p className="text-4xl font-bold">
            {stats.high_risk_transactions}
          </p>
        </div>

        <div className="bg-purple-600 text-white p-6 rounded-xl shadow">
          <h2>Fraud Rate</h2>
          <p className="text-4xl font-bold">
            {stats.fraud_rate}
          </p>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-2 gap-6 mt-10">
        <div className="bg-white p-6 rounded-xl shadow">
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

        <div className="bg-white p-6 rounded-xl shadow">
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
      <div className="mt-10 bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-5">
          Create Transaction
        </h2>

        <form
          onSubmit={createTransaction}
          className="grid grid-cols-4 gap-4"
        >
          <input
            type="number"
            placeholder="User ID"
            value={userId}
            onChange={(e) =>
              setUserId(e.target.value)
            }
            className="border p-3 rounded"
            required
          />

          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
            className="border p-3 rounded"
            required
          />

          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) =>
              setLocation(e.target.value)
            }
            className="border p-3 rounded"
            required
          />

          <button
            className="bg-blue-600 text-white rounded"
            type="submit"
          >
            Create
          </button>
        </form>
      </div>

      {/* SEARCH + FILTER */}
      <div className="mt-10 flex gap-4">
        <input
          type="text"
          placeholder="Search by ID or Location"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="border p-3 rounded w-80"
        />

        <select
          value={filter}
          onChange={(e) =>
            setFilter(e.target.value)
          }
          className="border p-3 rounded"
        >
          <option value="ALL">ALL</option>
          <option value="SAFE">SAFE</option>
          <option value="FRAUD">FRAUD</option>
          <option value="HIGH_RISK">
            HIGH_RISK
          </option>
        </select>
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="bg-white mt-8 p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-5">
          Transactions
        </h2>

        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">
                User ID
              </th>
              <th className="p-3 text-left">
                Amount
              </th>
              <th className="p-3 text-left">
                Location
              </th>
              <th className="p-3 text-left">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredTransactions.map(
              (transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b"
                >
                  <td className="p-3">
                    {transaction.id}
                  </td>

                  <td className="p-3">
                    {transaction.user_id}
                  </td>

                  <td className="p-3">
                    ₹{transaction.amount}
                  </td>

                  <td className="p-3">
                    {transaction.location}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded text-white ${
                        transaction.status ===
                        "SAFE"
                          ? "bg-green-500"
                          : transaction.status ===
                            "FRAUD"
                          ? "bg-yellow-500"
                          : "bg-red-600"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* FRAUD ALERTS */}
      <div className="bg-white mt-10 p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-5">
          Fraud Alerts
        </h2>

        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3 text-left">
                Alert ID
              </th>
              <th className="p-3 text-left">
                Transaction ID
              </th>
              <th className="p-3 text-left">
                Reason
              </th>
            </tr>
          </thead>

          <tbody>
            {alerts.map((alert) => (
              <tr
                key={alert.id}
                className="border-b"
              >
                <td className="p-3">
                  {alert.id}
                </td>

                <td className="p-3">
                  {alert.transaction_id}
                </td>

                <td className="p-3">
                  {alert.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;