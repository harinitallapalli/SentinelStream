import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function Reports() {
  const [reports, setReports] = useState([]);
  const [generating, setGenerating] = useState(false);

  const loadReports = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/reports/");
      setReports(res.data || []);
    } catch (error) {
      console.error("Failed to load reports", error);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const generateReport = async () => {
    setGenerating(true);
    try {
      await axios.post("http://127.0.0.1:8000/reports/generate");
      await loadReports();
      alert("New compliance report generated successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to generate report.");
    } finally {
      setGenerating(false);
    }
  };

  const deleteReport = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report record?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/reports/${id}`);
      await loadReports();
    } catch (error) {
      console.error(error);
      alert("Failed to delete report.");
    }
  };

  const downloadReport = async (reportId, filename) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/reports/${reportId}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Failed to download report:", error);
      alert("Failed to download report file.");
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />

        <div className="page-header">
          <div>
            <p className="eyebrow">Data Archives</p>
            <h1>System Reports</h1>
            <p className="page-description">Generate, search, and download security audits, risk summaries, and AML compliance logs.</p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={generateReport}
            disabled={generating}
          >
            {generating ? "Generating..." : "Generate Security Audit"}
          </button>
        </div>

        {/* System Health Section */}
        <div className="stats-grid" style={{ marginBottom: "28px" }}>
          <div className="stat-card green">
            <span className="stat-label">System Uptime</span>
            <strong>99.98%</strong>
            <span className="stat-caption">All core processors active</span>
          </div>
          <div className="stat-card blue">
            <span className="stat-label">Decision Latency</span>
            <strong>14.2ms</strong>
            <span className="stat-caption">Average API response velocity</span>
          </div>
          <div className="stat-card purple">
            <span className="stat-label">Database Pool</span>
            <strong>Active</strong>
            <span className="stat-caption">PostgreSQL connection stable</span>
          </div>
          <div className="stat-card yellow">
            <span className="stat-label">Reports Stored</span>
            <strong>{reports.length} files</strong>
            <span className="stat-caption">Archived audits & compliance</span>
          </div>
        </div>

        <div className="table-card">
          <div className="table-card-header">
            <h2>Reports Repository</h2>
            <p>Historical audit file outputs available for download.</p>
          </div>

          <div className="reports-repository">
            {reports.length > 0 ? (
              reports.map((report) => (
                <div key={report.id} className="report-item-row">
                  <div className="report-item-meta">
                    <span className="report-file-icon">
                      {report.file_type === "PDF" ? "📕" : "📗"}
                    </span>
                    <div className="report-file-details">
                      <h3>{report.name}</h3>
                      <p>
                        Created on: {new Date(report.created_at).toLocaleString()} · Size: {report.file_size}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => downloadReport(report.id, report.name)}
                      style={{ padding: "8px 12px", fontSize: "0.8rem" }}
                    >
                      Download {report.file_type}
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => deleteReport(report.id)}
                      style={{ padding: "8px 12px", fontSize: "0.8rem", color: "var(--status-fraud)", borderColor: "rgba(244,63,94,0.2)" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state-row">
                No reports found in the repository. Click "Generate Security Audit" to create one.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
