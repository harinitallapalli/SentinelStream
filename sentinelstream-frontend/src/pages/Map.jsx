import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function Map() {
  const [liveFeeds, setLiveFeeds] = useState([
    { id: "TX1084", time: "Just now", amount: "₹84,500", location: "DarkWeb", status: "FRAUD" },
    { id: "TX1083", time: "1m ago", amount: "₹12,400", location: "Foreign IP", status: "HIGH_RISK" },
    { id: "TX1082", time: "3m ago", amount: "₹3,400", location: "Delhi", status: "SAFE" },
    { id: "TX1081", time: "5m ago", amount: "₹92,000", location: "Unknown proxy", status: "FRAUD" },
    { id: "TX1080", time: "8m ago", amount: "₹500", location: "Mumbai", status: "SAFE" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const ids = ["TX10" + Math.floor(Math.random() * 100 + 85), "TX10" + Math.floor(Math.random() * 100 + 185)];
      const locs = ["DarkWeb", "Foreign Proxy", "London", "Northeast US", "New York", "Southwest Asia"];
      const statuses = ["FRAUD", "HIGH_RISK", "SAFE"];
      const amounts = ["₹" + (Math.floor(Math.random() * 90000) + 1000).toLocaleString(), "₹" + (Math.floor(Math.random() * 8000) + 200).toLocaleString()];
      
      const newFeed = {
        id: ids[Math.floor(Math.random() * ids.length)],
        time: "Just now",
        amount: amounts[Math.floor(Math.random() * amounts.length)],
        location: locs[Math.floor(Math.random() * locs.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)]
      };
      
      setLiveFeeds(prev => {
        const updated = prev.map(f => {
          if (f.time === "Just now") return { ...f, time: "1m ago" };
          if (f.time.includes("m ago")) {
            const m = parseInt(f.time) + 1;
            return { ...f, time: `${m}m ago` };
          }
          return f;
        });
        return [newFeed, ...updated.slice(0, 4)];
      });
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />

        <div className="page-header">
          <div>
            <p className="eyebrow">Real-Time Threat Intelligence</p>
            <h1>Global Fraud Map</h1>
            <p className="page-description">Geographical visualization of incoming transaction risks and hotspot regions.</p>
          </div>
        </div>

        <div className="dashboard-row">
          <div className="map-world-container" style={{ minHeight: "440px" }}>
            <svg viewBox="0 0 1000 480" width="100%" height="100%" style={{ background: "transparent" }}>
              {/* Stylized high tech grid world grid */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Stylized world maps vector outlines (simplified high-tech dots/paths representation) */}
              {/* North America */}
              <path d="M150,100 L250,90 L320,120 L300,180 L250,220 L220,190 L160,170 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              {/* South America */}
              <path d="M280,240 L340,260 L360,320 L340,420 L310,400 L280,300 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              {/* Eurasia / Africa */}
              <path d="M440,120 L550,80 L720,100 L850,120 L800,240 L680,280 L580,240 L480,180 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              {/* Africa */}
              <path d="M450,200 L530,210 L560,280 L520,380 L470,320 L440,240 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              {/* Australia */}
              <path d="M740,300 L820,310 L810,360 L730,340 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

              {/* Connections / Attack vectors */}
              <path d="M280,140 Q400,100 480,120" fill="none" stroke="rgba(244, 63, 94, 0.4)" strokeWidth="1.5" strokeDasharray="5,5" />
              <path d="M560,160 Q660,120 720,130" fill="none" stroke="rgba(244, 63, 94, 0.4)" strokeWidth="1.5" strokeDasharray="5,5" />
              <path d="M510,260 Q420,200 320,150" fill="none" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="1.5" strokeDasharray="5,5" />

              {/* Threat Hotspots - Pulsing rings */}
              {/* Northeast US */}
              <g transform="translate(280, 140)">
                <circle r="20" className="map-glow-ring" />
                <circle r="4" className="map-glow-point" />
              </g>

              {/* Western Europe */}
              <g transform="translate(480, 120)">
                <circle r="20" className="map-glow-ring" style={{ animationDelay: "0.5s" }} />
                <circle r="4" className="map-glow-point" />
              </g>

              {/* Southwest Asia */}
              <g transform="translate(560, 160)">
                <circle r="20" className="map-glow-ring" style={{ animationDelay: "1s" }} />
                <circle r="4" className="map-glow-point" />
              </g>

              {/* East Asia */}
              <g transform="translate(720, 130)">
                <circle r="20" className="map-glow-ring" style={{ animationDelay: "1.5s" }} />
                <circle r="4" className="map-glow-point" />
              </g>
            </svg>

            {/* Map Legend */}
            <div style={{ position: "absolute", bottom: "16px", left: "16px", display: "flex", gap: "16px", background: "rgba(10,12,28,0.85)", padding: "10px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <span style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f43f5e" }}></span>
                Fraud Source
              </span>
              <span style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b" }}></span>
                High Risk Area
              </span>
            </div>
          </div>

          {/* High Risk Regions and Live Feeds sidebar */}
          <div className="table-card" style={{ padding: "20px" }}>
            <div className="chart-card-header" style={{ marginBottom: "16px" }}>
              <div>
                <h2>High-Risk Regions</h2>
                <p>Hotspots ranked by alert frequency.</p>
              </div>
            </div>

            <ul className="insight-list" style={{ marginBottom: "24px" }}>
              <li style={{ padding: "12px 14px" }}>
                <div>
                  <strong style={{ fontSize: "0.9rem" }}>Northeast US</strong>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>IP spoofing, card testing</div>
                </div>
                <span className="status fraud">Critical</span>
              </li>
              <li style={{ padding: "12px 14px" }}>
                <div>
                  <strong style={{ fontSize: "0.9rem" }}>Southwest Asia</strong>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>Account takeovers</div>
                </div>
                <span className="status high_risk">High</span>
              </li>
              <li style={{ padding: "12px 14px" }}>
                <div>
                  <strong style={{ fontSize: "0.9rem" }}>Western Europe</strong>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>Velocity thresholds</div>
                </div>
                <span className="status review">Medium</span>
              </li>
            </ul>

            <div className="chart-card-header" style={{ marginBottom: "12px" }}>
              <h2>Live Threat Stream</h2>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {liveFeeds.map((feed, idx) => (
                <div key={idx} style={{ display: "flex", justifySelf: "stretch", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "8px" }}>
                  <div>
                    <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#3b82f6" }}>{feed.id}</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginLeft: "8px" }}>{feed.location}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: "bold" }}>{feed.amount}</span>
                    <span className={`status ${feed.status.toLowerCase()}`} style={{ fontSize: "0.65rem", padding: "2px 6px" }}>{feed.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Map;
