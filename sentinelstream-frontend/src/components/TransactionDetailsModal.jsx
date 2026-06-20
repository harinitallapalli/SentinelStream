import { useState } from "react";
import axios from "axios";

function TransactionDetailsModal({ transaction, alertItem, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);

  if (!transaction) return null;

  // Generate mock user details based on user_id
  const mockUsers = {
    1: { name: "Aarav Sharma", email: "aarav.sharma@example.com", status: "Active", score: 12 },
    2: { name: "Ananya Patel", email: "ananya.patel@example.com", status: "Under Review", score: 78 },
    3: { name: "Vihaan Gupta", email: "vihaan.gupta@example.com", status: "Suspended", score: 95 },
    4: { name: "Diya Iyer", email: "diya.iyer@example.com", status: "Active", score: 25 },
    5: { name: "Kabir Mehta", email: "kabir.mehta@example.com", status: "Active", score: 45 },
  };

  const defaultUser = {
    name: `User #${transaction.user_id}`,
    email: `user${transaction.user_id}@example.com`,
    status: "Active",
    score: Math.floor((transaction.amount > 50000 ? 80 : transaction.amount > 10000 ? 55 : 15) + (transaction.user_id % 10) * 2),
  };

  const user = mockUsers[transaction.user_id] || defaultUser;

  // Get risk level details
  const getRiskDetails = (status) => {
    switch (status) {
      case "SAFE":
        return { color: "green", text: "Low Risk Verified" };
      case "HIGH_RISK":
        return { color: "yellow", text: "Suspicious Activity Detected" };
      case "FRAUD":
        return { color: "red", text: "Confirmed Fraud Case" };
      default:
        return { color: "blue", text: "Pending Review" };
    }
  };

  const risk = getRiskDetails(transaction.status);

  const updateStatus = async (newStatus) => {
    setLoading(true);
    try {
      await axios.put(`http://127.0.0.1:8000/transactions/${transaction.id}/status?status=${newStatus}`);
      onUpdate();
      alert(`Transaction status updated to ${newStatus}`);
    } catch (error) {
      console.error(error);
      alert("Failed to update transaction status.");
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async () => {
    if (!alertItem) return;
    setLoading(true);
    try {
      await axios.put(`http://127.0.0.1:8000/alerts/${alertItem.id}/resolve`, {
        review_notes: reviewNotes,
        reason_code: reasonCode
      });
      onUpdate();
      alert("Alert marked as resolved.");
    } catch (error) {
      console.error(error);
      alert("Failed to resolve alert.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <div className="modal-header">
          <h2>Transaction details</h2>
          <p style={{ color: "#64748b", marginTop: "4px" }}>
            Transaction ID: <strong>#{transaction.id}</strong>
          </p>
        </div>

        <div className="modal-body">
          <div className="modal-section">
            <h3>Payment Information</h3>
            <div className="modal-grid">
              <div className="modal-item">
                <span>Amount</span>
                <strong style={{ fontSize: "1.2rem", color: "#2563eb" }}>₹{transaction.amount}</strong>
              </div>
              <div className="modal-item">
                <span>Location</span>
                <strong>{transaction.location}</strong>
              </div>
              <div className="modal-item">
                <span>Status</span>
                <div>
                  <span className={`status ${transaction.status?.toLowerCase()}`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
              <div className="modal-item">
                <span>Timestamp</span>
                <strong>{transaction.timestamp || transaction.date || "-"}</strong>
              </div>
            </div>
          </div>

          <div className="modal-section">
            <h3>User Risk Profile</h3>
            <div className="modal-user-profile">
              <div className="modal-grid">
                <div className="modal-item">
                  <span>Name</span>
                  <strong>{user.name}</strong>
                </div>
                <div className="modal-item">
                  <span>Account Status</span>
                  <strong>{user.status}</strong>
                </div>
                <div className="modal-item">
                  <span>Email</span>
                  <strong style={{ fontSize: "0.9rem" }}>{user.email}</strong>
                </div>
                <div className="modal-item">
                  <span>Risk Score</span>
                  <strong style={{ color: user.score > 70 ? "#ef4444" : user.score > 40 ? "#f59e0b" : "#22c55e" }}>
                    {user.score}/100
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {alertItem && (
            <div className="modal-section" style={{ borderLeft: "4px solid #ef4444", paddingLeft: "12px" }}>
              <h3>Associated Fraud Alert</h3>
              <p style={{ fontSize: "0.9rem" }}>
                Reason: <strong>{alertItem.reason}</strong> | Priority: <strong style={{ color: alertItem.priority === "HIGH" ? "#ef4444" : "#f59e0b" }}>{alertItem.priority || "MEDIUM"}</strong>
              </p>
              <p style={{ fontSize: "0.9rem", color: "#64748b", marginTop: "4px" }}>
                Status: <strong style={{ color: alertItem.resolved ? "#10b981" : "#ef4444" }}>{alertItem.resolved ? "Resolved" : "Open"}</strong>
              </p>

              {alertItem.resolved ? (
                <div style={{ marginTop: "12px", background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <p style={{ fontSize: "0.85rem", margin: "2px 0" }}>Reason Code: <strong style={{ color: "#475569" }}>{alertItem.reason_code || "N/A"}</strong></p>
                  <p style={{ fontSize: "0.85rem", margin: "2px 0" }}>Notes: <span style={{ color: "#64748b", fontStyle: "italic" }}>"{alertItem.review_notes || "No notes added"}"</span></p>
                  <p style={{ fontSize: "0.8rem", margin: "2px 0", color: "#94a3b8" }}>Resolved by: {alertItem.resolved_by || "System"} on {alertItem.resolved_at ? new Date(alertItem.resolved_at).toLocaleString() : "N/A"}</p>
                </div>
              ) : (
                isAuthorized && (
                  <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#475569" }}>Reason Code</span>
                      <select 
                        value={reasonCode} 
                        onChange={(e) => setReasonCode(e.target.value)}
                        style={{ padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#fff", fontSize: "0.85rem" }}
                      >
                        <option value="LEGITIMATE_BEHAVIOR">Legitimate User Behavior</option>
                        <option value="CARD_TESTING">Card Testing / Velocity Abuse</option>
                        <option value="ACCOUNT_TAKEOVER">Account Takeover (ATO)</option>
                        <option value="STOLEN_CREDENTIALS">Stolen Credentials / Identity Fraud</option>
                        <option value="MISTAKE">User Error / Accidental</option>
                        <option value="OTHER">Other Suspicious Behavior</option>
                      </select>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#475569" }}>Review Notes</span>
                      <textarea 
                        placeholder="Add review notes or justification..." 
                        value={reviewNotes} 
                        onChange={(e) => setReviewNotes(e.target.value)}
                        style={{ padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", height: "60px", resize: "none" }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          <div className="modal-section">
            <h3>Risk Controls</h3>
            {!isAuthorized && (
              <p style={{ color: "#ef4444", fontSize: "0.85rem", margin: "4px 0" }}>
                🔒 Read-only view: You do not have permissions to modify transaction status or resolve alerts.
              </p>
            )}
            <div className="modal-actions">
              <button 
                className="btn btn-secondary" 
                disabled={loading || !isAuthorized || transaction.status === "SAFE"}
                onClick={() => updateStatus("SAFE")}
                style={{ flex: 1, background: transaction.status === "SAFE" ? "#f1f5f9" : "", cursor: (!isAuthorized || loading) ? "not-allowed" : "pointer" }}
              >
                Mark Safe
              </button>
              <button 
                className="btn btn-secondary" 
                disabled={loading || !isAuthorized || transaction.status === "FRAUD"}
                onClick={() => updateStatus("FRAUD")}
                style={{ flex: 1, border: "1px solid #ef4444", color: "#ef4444", cursor: (!isAuthorized || loading) ? "not-allowed" : "pointer" }}
              >
                Mark Fraud
              </button>
              {alertItem && !alertItem.resolved && (
                <button 
                  className="btn btn-primary" 
                  disabled={loading || !isAuthorized || !reviewNotes.trim()}
                  onClick={resolveAlert}
                  style={{ 
                    flex: 1.2, 
                    background: (!isAuthorized || !reviewNotes.trim()) ? "#cbd5e1" : "#10b981", 
                    cursor: (loading || !isAuthorized || !reviewNotes.trim()) ? "not-allowed" : "pointer" 
                  }}
                  title={!reviewNotes.trim() ? "Please add review notes first" : "Resolve alert"}
                >
                  Resolve Alert
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionDetailsModal;

