import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/transactions/");
        setTransactions(response.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    loadTransactions();
  }, []);

  const filteredTransactions = transactions.filter((transaction) => {
    const query = search.toLowerCase();
    const matchesSearch =
      transaction.location?.toLowerCase().includes(query) ||
      transaction.user_id?.toString().includes(query) ||
      transaction.id?.toString().includes(query);
    const matchesFilter = filter === "ALL" ? true : transaction.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />

        <div className="page-header">
          <div>
            <h1>Transactions</h1>
            <p>Manage every payment flow with search, filter, and table controls.</p>
          </div>
          <button className="btn btn-primary">Export CSV</button>
        </div>

        <div className="filter-row">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by transaction ID, user ID or location"
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="ALL">ALL</option>
            <option value="SAFE">SAFE</option>
            <option value="FRAUD">FRAUD</option>
            <option value="HIGH_RISK">HIGH_RISK</option>
          </select>
          <button className="btn btn-secondary">Search</button>
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
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
                    No transactions found.
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

export default Transactions;
