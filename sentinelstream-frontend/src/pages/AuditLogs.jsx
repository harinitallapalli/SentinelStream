import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

function AuditLogs() {
  const { user, isAdmin } = useAuth();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://127.0.0.1:8000/audit/logs");
      setLogs(res.data || []);
    } catch (error) {
      console.error("Failed to load audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/audit/stats");
      setStats(res.data);
    } catch (error) {
      console.error("Failed to load audit stats:", error);
    }
  };

  useEffect(() => {
    loadLogs();
    loadStats();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filter === "ALL" || log.action === filter;
    const matchesSearch =
      search === "" ||
      log.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.resource_type?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getActionColor = (action) => {
    const colors = {
      LOGIN: "#10b981",
      LOGOUT: "#64748b",
      LOGIN_FAILED: "#ef4444",
      REGISTER: "#3b82f6",
      CREATE: "#3b82f6",
      UPDATE: "#f59e0b",
      DELETE: "#ef4444",
      RESOLVE: "#10b981",
      BULK_RESOLVE: "#8b5cf6",
      VIEW: "#64748b",
    };
    return colors[action] || "#64748b";
  };

  const getStatusBadge = (status) => {
    if (status === "SUCCESS") {
      return <span style={{ color: "#10b981", fontSize: "0.75rem", background: "#dcfce7", padding: "2px 8px", borderRadius: "4px" }}>SUCCESS</span>;
    }
    return <span style={{ color: "#ef4444", fontSize: "0.75rem", background: "#fee2e2", padding: "2px 8px", borderRadius: "4px" }}>{status}</span>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (!isAdmin) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Navbar />
          <div className="page-header">
            <div>
              <h1>Access Denied</h1>
              <p>You do not have permission to access Audit Logs. This feature requires Admin role.</p>
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
            <p className="eyebrow">Security & Compliance</p>
            <h1>Audit Logs</h1>
            <p className="page-description">Track all user actions, security events, and system activities.</p>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="stats-grid" style={{ marginBottom: "28px" }}>
            <div className="stat-card blue">
              <span className="stat-label">Total Logs</span>
              <strong>{stats.total_logs || 0}</strong>
              <span className="stat-caption">All recorded events</span>
            </div>
            <div className="stat-card green">
              <span className="stat-label">Successful</span>
              <strong>{stats.by_status?.SUCCESS || 0}</strong>
              <span className="stat-caption">Completed actions</span>
            </div>
            <div className="stat-card red">
              <span className="stat-label">Failed</span>
              <strong>{stats.by_status?.FAILURE || 0}</strong>
              <span className="stat-caption">Failed attempts</span>
            </div>
            <div className="stat-card yellow">
              <span className="stat-label">Recent Failures</span>
              <strong>{stats.recent_failures || 0}</strong>
              <span className="stat-caption">Last 24 hours</span>
            </div>
          </div>
        )}

        <div className="table-card">
          <div className="table-card-header">
            <h2>Activity Log</h2>
            <div className="table-actions">
              <input
                type="text"
                placeholder="Search by user, action, or resource..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="ALL">All Actions</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="LOGIN_FAILED">Failed Login</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="RESOLVE">Resolve</option>
              </select>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Details</th>
                <th>IP Address</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>
                    Loading audit logs...
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: "0.85rem", color: "#64748b" }}>
                      {formatDate(log.created_at)}
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>
                          {log.user_name || "System"}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {log.user_email || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          color: getActionColor(log.action),
                          fontWeight: "bold",
                          fontSize: "0.85rem",
                          background: `${getActionColor(log.action)}15`,
                          padding: "4px 8px",
                          borderRadius: "4px"
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.85rem" }}>
                        {log.resource_type || "N/A"}
                        {log.resource_id && ` #${log.resource_id}`}
                      </span>
                    </td>
                    <td>
                      {log.details && (
                        <div style={{ fontSize: "0.75rem", color: "#64748b", maxWidth: "200px" }}>
                          {Object.entries(log.details).map(([key, value]) => (
                            <div key={key}>
                              <strong>{key}:</strong> {String(value).substring(0, 30)}
                              {String(value).length > 30 && "..."}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      {log.ip_address || "N/A"}
                    </td>
                    <td>{getStatusBadge(log.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-state-row">
                    No audit logs found matching your filters.
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

export default AuditLogs;
