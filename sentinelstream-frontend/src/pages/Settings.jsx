import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

function Settings() {
  const { canEditSettings, user } = useAuth();
  // Fraud Rules State
  const [fraudThreshold, setFraudThreshold] = useState(10000.0);
  const [highRiskThreshold, setHighRiskThreshold] = useState(50000.0);
  const [suspiciousLocations, setSuspiciousLocations] = useState("");
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [twoFactor, setTwoFactor] = useState(false);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [rulesSuccess, setRulesSuccess] = useState("");

  // API Keys State
  const [keys, setKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState(null); // stores { raw_token, key_name }
  const [keysLoading, setKeysLoading] = useState(false);

  const fetchRules = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/settings/rules");
      const data = response.data;
      setFraudThreshold(data.fraud_amount_threshold);
      setHighRiskThreshold(data.high_risk_amount_threshold);
      setSuspiciousLocations(data.suspicious_locations);
      setSessionTimeout(data.session_timeout);
      setTwoFactor(data.two_factor_enabled);
    } catch (error) {
      console.error("Failed to load fraud settings:", error);
    }
  };

  const fetchKeys = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/settings/keys");
      setKeys(response.data || []);
    } catch (error) {
      console.error("Failed to load API keys:", error);
    }
  };

  useEffect(() => {
    fetchRules();
    fetchKeys();
  }, []);

  const saveRules = async (e) => {
    e.preventDefault();
    setRulesLoading(true);
    setRulesSuccess("");
    try {
      await axios.post("http://127.0.0.1:8000/settings/rules", {
        fraud_amount_threshold: parseFloat(fraudThreshold),
        high_risk_amount_threshold: parseFloat(highRiskThreshold),
        suspicious_locations: suspiciousLocations,
        two_factor_enabled: twoFactor,
        session_timeout: parseInt(sessionTimeout),
      });
      setRulesSuccess("Fraud risk rules saved successfully!");
      setTimeout(() => setRulesSuccess(""), 3000);
    } catch (error) {
      console.error("Failed to save rules:", error);
      alert("Failed to update fraud settings.");
    } finally {
      setRulesLoading(false);
    }
  };

  const createKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setKeysLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:8000/settings/keys", {
        key_name: newKeyName,
      });
      setGeneratedKey({
        raw_token: response.data.raw_token,
        key_name: response.data.key.key_name,
      });
      setNewKeyName("");
      await fetchKeys();
    } catch (error) {
      console.error("Failed to create key:", error);
      alert("Failed to generate API Key.");
    } finally {
      setKeysLoading(false);
    }
  };

  const revokeKey = async (keyId) => {
    if (!confirm("Are you sure you want to revoke this API Key? Any integrations using this token will stop functioning immediately.")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/settings/keys/${keyId}`);
      await fetchKeys();
    } catch (error) {
      console.error("Failed to revoke key:", error);
      alert("Failed to revoke API Key.");
    }
  };

  if (!canEditSettings) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Navbar />
          <div className="page-header">
            <div>
              <h1>Access Denied</h1>
              <p>You do not have permission to access Settings. This feature requires Admin role.</p>
            </div>
          </div>
          <div className="table-card" style={{ padding: "40px", textAlign: "center" }}>
            <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🔒</div>
            <h3 style={{ color: "#64748b" }}>Admin Access Required</h3>
            <p style={{ color: "#94a3b8", marginTop: "10px" }}>
              Your current role: <strong>{user?.role || "Unknown"}</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />

        <div className="page-header">
          <div>
            <h1>Platform Settings</h1>
            <p>Define risk scoring thresholds, velocity control list, and manage API integrations.</p>
            <div style={{ marginTop: "8px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Your Role: <strong style={{ color: "#ef4444" }}>{user?.role}</strong> - Full system access
            </div>
          </div>
        </div>

        <div className="dashboard-row" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
          
          {/* Fraud Rules Form */}
          <div className="table-card" style={{ padding: "28px" }}>
            <div className="chart-card-header" style={{ marginBottom: "20px" }}>
              <h2>Customize Fraud Detection Rules</h2>
              <p>Threshold adjustments apply to newly processed transactions instantly.</p>
            </div>

            {rulesSuccess && (
              <div style={{ padding: "12px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "10px", color: "#16a34a", fontSize: "0.9rem", marginBottom: "18px" }}>
                {rulesSuccess}
              </div>
            )}

            <form onSubmit={saveRules} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <div>
                  <label className="form-label" style={{ fontWeight: "bold", fontSize: "0.85rem", color: "#374151" }}>
                    Fraud Amount Threshold (₹)
                    <input 
                      type="number" 
                      className="form-control"
                      value={fraudThreshold} 
                      onChange={(e) => setFraudThreshold(e.target.value)}
                      style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #d1d5db" }}
                      required
                    />
                  </label>
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: "bold", fontSize: "0.85rem", color: "#374151" }}>
                    High-Risk Amount Threshold (₹)
                    <input 
                      type="number" 
                      className="form-control"
                      value={highRiskThreshold} 
                      onChange={(e) => setHighRiskThreshold(e.target.value)}
                      style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #d1d5db" }}
                      required
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: "bold", fontSize: "0.85rem", color: "#374151" }}>
                  Suspicious Locations (Comma separated)
                  <textarea 
                    className="form-control"
                    value={suspiciousLocations} 
                    onChange={(e) => setSuspiciousLocations(e.target.value)}
                    style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #d1d5db", height: "80px", fontFamily: "monospace" }}
                    placeholder="e.g. Unknown,Foreign,DarkWeb"
                    required
                  />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <div>
                  <label className="form-label" style={{ fontWeight: "bold", fontSize: "0.85rem", color: "#374151" }}>
                    Console Session Timeout (Minutes)
                    <input 
                      type="number" 
                      className="form-control"
                      value={sessionTimeout} 
                      onChange={(e) => setSessionTimeout(e.target.value)}
                      style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #d1d5db" }}
                      required
                    />
                  </label>
                </div>
                <div style={{ display: "flex", alignItems: "center", marginTop: "24px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", fontWeight: "bold", color: "#374151", cursor: "pointer" }}>
                    <input 
                      type="checkbox" 
                      checked={twoFactor} 
                      onChange={(e) => setTwoFactor(e.target.checked)}
                      style={{ width: "18px", height: "18px", cursor: "pointer" }}
                    />
                    Enforce 2FA for Administrators
                  </label>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={rulesLoading}
                style={{ width: "fit-content", padding: "12px 24px", marginTop: "10px" }}
              >
                {rulesLoading ? "Saving settings..." : "Save Platform Rules"}
              </button>
            </form>
          </div>

          {/* API Keys Table */}
          <div className="table-card" style={{ padding: "28px" }}>
            <div className="chart-card-header" style={{ marginBottom: "20px" }}>
              <h2>Developer API Keys</h2>
              <p>Integrate SentinelStream fraud screening into external checkout gateways.</p>
            </div>

            <form onSubmit={createKey} style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
              <input 
                type="text" 
                placeholder="Key Name (e.g. Stripe checkout)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }}
                required
              />
              <button type="submit" className="btn btn-primary" disabled={keysLoading}>
                Generate Key
              </button>
            </form>

            <table style={{ width: "100%", fontSize: "0.9rem" }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Preview Token</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.length > 0 ? (
                  keys.map((k) => (
                    <tr key={k.id}>
                      <td style={{ fontWeight: "bold" }}>{k.key_name}</td>
                      <td style={{ fontFamily: "monospace", color: "#475569" }}>{k.token_preview}</td>
                      <td style={{ textAlign: "right" }}>
                        <button 
                          className="btn" 
                          onClick={() => revokeKey(k.id)}
                          style={{ background: "#ef4444", color: "white", padding: "4px 8px", fontSize: "0.75rem", borderRadius: "6px" }}
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: "center", color: "#64748b", padding: "20px" }}>
                      No active API keys found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal displaying generated raw API Key */}
        {generatedKey && (
          <div className="modal-overlay" onClick={() => setGeneratedKey(null)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
              <div className="modal-header">
                <h2>API Key Generated</h2>
                <p style={{ color: "#ef4444", fontWeight: "bold", marginTop: "4px" }}>
                  Please copy this key now. It will not be shown again.
                </p>
              </div>
              <div className="modal-body" style={{ padding: "10px 0" }}>
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <span style={{ fontSize: "0.8rem", color: "#64748b" }}>KEY NAME: <strong>{generatedKey.key_name}</strong></span>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <input 
                      type="text" 
                      value={generatedKey.raw_token} 
                      readOnly 
                      style={{ flex: 1, padding: "10px", fontFamily: "monospace", background: "#fff", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem" }} 
                      id="raw-key-input"
                    />
                    <button 
                      className="btn btn-secondary"
                      onClick={() => {
                        const copyText = document.getElementById("raw-key-input");
                        copyText.select();
                        navigator.clipboard.writeText(copyText.value);
                        alert("Copied to clipboard!");
                      }}
                      style={{ padding: "10px" }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
              <div className="modal-section" style={{ display: "flex", justifyContent: "flex-end", marginTop: "14px" }}>
                <button className="btn btn-primary" onClick={() => setGeneratedKey(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Settings;
