import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import TransactionDetailsModal from "../components/TransactionDetailsModal";
import { useAuth } from "../context/AuthContext";

function Alerts() {
  const { canResolveAlerts, user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedAlertIds, setSelectedAlertIds] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const loadData = async () => {
    try {
      const [alertsRes, transactionsRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/alerts/"),
        axios.get("http://127.0.0.1:8000/transactions/"),
      ]);
      setAlerts(alertsRes.data || []);
      setTransactions(transactionsRes.data || []);

      // If details modal is open, update the transaction data reactively
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

    // Live WebSockets synchronization for alerts table
    const ws = new WebSocket("ws://127.0.0.1:8000/alerts/ws");
    ws.onopen = () => {
      console.log("WebSocket connected for alerts");
    };
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("WebSocket message received:", message);
        if (message.type === "NEW_ALERT") {
          loadData();
        }
      } catch (e) {
        console.error("Alert page WS error:", e);
      }
    };
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleSelectAlert = (alertId) => {
    setSelectedAlertIds((prev) =>
      prev.includes(alertId) ? prev.filter((id) => id !== alertId) : [...prev, alertId]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Select all open alerts
      const openAlertIds = alerts.filter((a) => !a.resolved).map((a) => a.id);
      setSelectedAlertIds(openAlertIds);
    } else {
      setSelectedAlertIds([]);
    }
  };

  const resolveSelectedAlerts = async () => {
    if (selectedAlertIds.length === 0) return;
    if (!canResolveAlerts) {
      alert("You do not have permission to resolve alerts. This feature requires Analyst or Admin role.");
      return;
    }
    try {
      await axios.post("http://127.0.0.1:8000/alerts/resolve-multiple", {
        alert_ids: selectedAlertIds,
        review_notes: "Bulk resolved by user",
        reason_code: "RESOLVED_BULK"
      });
      alert(`Resolved ${selectedAlertIds.length} alert(s).`);
      setSelectedAlertIds([]);
      await loadData();
    } catch (error) {
      console.error(error);
      alert("Failed to resolve selected alerts.");
    }
  };

  const resolveSingleAlert = async (alertId) => {
    if (!canResolveAlerts) {
      alert("You do not have permission to resolve alerts. This feature requires Analyst or Admin role.");
      return;
    }
    try {
      await axios.put(`http://127.0.0.1:8000/alerts/${alertId}/resolve`, {
        review_notes: "Alert resolved by user",
        reason_code: "RESOLVED_MANUAL"
      });
      alert("Alert resolved.");
      // Unselect it if it was checked
      setSelectedAlertIds((prev) => prev.filter((id) => id !== alertId));
      await loadData();
    } catch (error) {
      console.error(error);
      alert("Failed to resolve alert.");
    }
  };

  const openTxModal = (transactionId) => {
    const tx = transactions.find((t) => t.id === transactionId);
    if (tx) {
      setSelectedTransaction(tx);
    } else {
      alert(`Transaction #${transactionId} not found.`);
    }
  };

  const allOpenAlertsSelected =
    alerts.filter((a) => !a.resolved).length > 0 &&
    alerts.filter((a) => !a.resolved).every((a) => selectedAlertIds.includes(a.id));

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />

        <div className="page-header">
          <div>
            <h1>Fraud Alerts</h1>
            <p>Review high-risk alerts and act on suspicious transactions.</p>
            <div style={{ marginTop: "8px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Your Role: <strong style={{ color: canResolveAlerts ? "#3b82f6" : "#10b981" }}>{user?.role}</strong>
              {canResolveAlerts ? " - Can resolve alerts" : " - View only access"}
            </div>
          </div>
          {canResolveAlerts && (
            <button 
              className="btn btn-primary"
              onClick={resolveSelectedAlerts}
              disabled={selectedAlertIds.length === 0}
              style={{ 
                background: selectedAlertIds.length === 0 ? "#cbd5e1" : "#2563eb",
                cursor: selectedAlertIds.length === 0 ? "not-allowed" : "pointer" 
              }}
            >
              Resolve Selected ({selectedAlertIds.length})
            </button>
          )}
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
                <th style={{ width: "40px", textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={allOpenAlertsSelected}
                    onChange={handleSelectAll}
                    disabled={alerts.filter((a) => !a.resolved).length === 0}
                    style={{ cursor: "pointer", transform: "scale(1.2)" }}
                  />
                </th>
                <th>ID</th>
                <th>Transaction</th>
                <th>Reason</th>
                <th>Priority</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <tr key={alert.id}>
                    <td style={{ textAlign: "center" }}>
                      {!alert.resolved ? (
                        <input
                          type="checkbox"
                          checked={selectedAlertIds.includes(alert.id)}
                          onChange={() => handleSelectAlert(alert.id)}
                          style={{ cursor: "pointer", transform: "scale(1.2)" }}
                        />
                      ) : (
                        <span style={{ color: "#10b981", fontWeight: "bold" }}>✓</span>
                      )}
                    </td>
                    <td>{alert.id}</td>
                    <td>
                      <button 
                        onClick={() => openTxModal(alert.transaction_id)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#2563eb",
                          textDecoration: "underline",
                          fontWeight: "bold",
                          cursor: "pointer",
                          padding: 0,
                          fontSize: "inherit"
                        }}
                        title="View transaction details"
                      >
                        #{alert.transaction_id}
                      </button>
                    </td>
                    <td>{alert.reason}</td>
                    <td>
                      <span className={`status ${alert.priority === "HIGH" ? "fraud" : "high_risk"}`} style={{ minWidth: "70px", padding: "4px 8px" }}>
                        {alert.priority || "MEDIUM"}
                      </span>
                    </td>
                    <td>
                      <span className={`status ${alert.resolved ? "safe" : "review"}`} style={{ minWidth: "90px", padding: "4px 8px" }}>
                        {alert.resolved ? "Resolved" : "Open"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {!alert.resolved ? (
                        canResolveAlerts ? (
                          <button
                            className="btn btn-primary"
                            onClick={() => resolveSingleAlert(alert.id)}
                            style={{ padding: "6px 12px", fontSize: "0.8rem", borderRadius: "10px", background: "#10b981" }}
                          >
                            Resolve
                          </button>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: "0.75rem", background: "#f1f5f9", padding: "4px 8px", borderRadius: "6px" }}>
                            View Only
                          </span>
                        )
                      ) : (
                        <span style={{ color: "#64748b", fontSize: "0.85rem" }}>None</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-state-row">
                    No fraud alerts found.
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

export default Alerts;
