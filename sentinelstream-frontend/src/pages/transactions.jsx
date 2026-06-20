import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import TransactionDetailsModal from "../components/TransactionDetailsModal";
import { generatePDFReport } from "../utils/pdfGenerator";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const loadData = async () => {
    try {
      const [transactionsRes, alertsRes, statsRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/transactions/"),
        axios.get("http://127.0.0.1:8000/alerts/"),
        axios.get("http://127.0.0.1:8000/stats/"),
      ]);
      setTransactions(transactionsRes.data || []);
      setAlerts(alertsRes.data || []);
      setStats(statsRes.data || {});

      // Proactively update open modal transaction if it exists
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

    // Establish WebSockets stream for real-time transactions syncing
    const ws = new WebSocket("ws://127.0.0.1:8000/alerts/ws");
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "NEW_ALERT") {
          loadData();
        }
      } catch (e) {
        console.error("Transactions page WS error:", e);
      }
    };

    return () => {
      ws.close();
    };
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
          <button 
            className="btn btn-primary" 
            onClick={() => generatePDFReport(transactions, stats)}
          >
            Download PDF Report
          </button>
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
          <button className="btn btn-secondary" onClick={loadData}>Search</button>
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
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

export default Transactions;
