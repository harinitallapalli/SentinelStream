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
  const [stats, setStats] = useState({
    total_transactions: 0,
    fraud_transactions: 0,
    safe_transactions: 0,
    fraud_rate: "0%",
  });

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

      const transactionRes = await axios.get(
        "http://127.0.0.1:8000/transactions/"
      );

      const alertRes = await axios.get(
        "http://127.0.0.1:8000/alerts/"
      );

      setStats(statsRes.data);
      setTransactions(transactionRes.data);
      setAlerts(alertRes.data);
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
      name: "Safe",
      value: stats.safe_transactions,
    },
    {
      name: "Fraud",
      value: stats.fraud_transactions,
    },
  ];

  const barData = [
    {
      name: "Transactions",
      Total: stats.total_transactions,
      Safe: stats.safe_transactions,
      Fraud: stats.fraud_transactions,
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

      {/* CARDS */}
      <div className="grid grid-cols-4 gap-5">
        <div className="bg-blue-500 text-white p-8 rounded-xl shadow">
          <h2 className="text-xl">Total Transactions</h2>
          <p className="text-5xl font-bold mt-3">
            {stats.total_transactions}
          </p>
        </div>

        <div className="bg-red-500 text-white p-8 rounded-xl shadow">
          <h2 className="text-xl">Fraud Alerts</h2>
          <p className="text-5xl font-bold mt-3">
            {stats.fraud_transactions}
          </p>
        </div>

        <div className="bg-green-500 text-white p-8 rounded-xl shadow">
          <h2 className="text-xl">Safe Transactions</h2>
          <p className="text-5xl font-bold mt-3">
            {stats.safe_transactions}
          </p>
        </div>

        <div className="bg-orange-500 text-white p-8 rounded-xl shadow">
          <h2 className="text-xl">Fraud Rate</h2>
          <p className="text-5xl font-bold mt-3">
            {stats.fraud_rate}
          </p>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-2 gap-6 mt-10">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-3xl font-bold mb-5">
            Fraud Distribution
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                outerRadius={110}
                label
              >
                <Cell fill="#22c55e" />
                <Cell fill="#ef4444" />
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-3xl font-bold mb-5">
            Transaction Statistics
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Bar dataKey="Total" fill="#3b82f6" />
              <Bar dataKey="Safe" fill="#22c55e" />
              <Bar dataKey="Fraud" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CREATE FORM */}
      <div className="mt-10 bg-white p-8 rounded-xl shadow">
        <h2 className="text-3xl font-bold mb-6">
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
            className="border p-4 rounded-lg"
            required
          />

          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
            className="border p-4 rounded-lg"
            required
          />

          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) =>
              setLocation(e.target.value)
            }
            className="border p-4 rounded-lg"
            required
          />

          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg"
          >
            Create Transaction
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
          className="border p-3 rounded-lg w-80"
        />

        <select
          value={filter}
          onChange={(e) =>
            setFilter(e.target.value)
          }
          className="border p-3 rounded-lg"
        >
          <option value="ALL">All</option>
          <option value="SAFE">SAFE</option>
          <option value="FRAUD">FRAUD</option>
        </select>
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="mt-8 bg-white rounded-xl shadow p-6">
        <h2 className="text-3xl font-bold mb-6">
          Transactions
        </h2>

        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">User ID</th>
              <th className="p-4 text-left">Amount</th>
              <th className="p-4 text-left">Location</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="border-b"
              >
                <td className="p-4">
                  {transaction.id}
                </td>
                <td className="p-4">
                  {transaction.user_id}
                </td>
                <td className="p-4">
                  ₹{transaction.amount}
                </td>
                <td className="p-4">
                  {transaction.location}
                </td>
                <td className="p-4">
                  <span
                    className={`px-4 py-2 rounded-full text-white font-bold ${
                      transaction.status === "FRAUD"
                        ? "bg-red-500"
                        : "bg-green-500"
                    }`}
                  >
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FRAUD ALERTS TABLE */}
      <div className="mt-10 bg-white rounded-xl shadow p-6 mb-10">
        <h2 className="text-3xl font-bold mb-6">
          Fraud Alerts
        </h2>

        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="p-4 text-left">
                Alert ID
              </th>
              <th className="p-4 text-left">
                Transaction ID
              </th>
              <th className="p-4 text-left">
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
                <td className="p-4">
                  {alert.id}
                </td>
                <td className="p-4">
                  {alert.transaction_id}
                </td>
                <td className="p-4">
                  <span className="bg-red-500 text-white px-4 py-2 rounded-full">
                    {alert.reason}
                  </span>
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