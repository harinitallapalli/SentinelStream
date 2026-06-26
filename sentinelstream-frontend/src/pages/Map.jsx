import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Location coordinates for major cities/regions
const locationCoords = {
  "new york": [40.7128, -74.0060],
  "london": [51.5074, -0.1278],
  "delhi": [28.7041, 77.1025],
  "mumbai": [19.0760, 72.8777],
  "bangalore": [12.9716, 77.5946],
  "tokyo": [35.6762, 139.6503],
  "sydney": [-33.8688, 151.2093],
  "darkweb": [0, 0], // Will be randomized
  "foreign": [20, 0], // Will be randomized
  "unknown": [10, 10], // Will be randomized
};

function Map() {
  const [liveFeeds, setLiveFeeds] = useState([
    { id: "TX1084", time: "Just now", amount: "₹84,500", location: "DarkWeb", status: "FRAUD" },
    { id: "TX1083", time: "1m ago", amount: "₹12,400", location: "Foreign IP", status: "HIGH_RISK" },
    { id: "TX1082", time: "3m ago", amount: "₹3,400", location: "Delhi", status: "SAFE" },
    { id: "TX1081", time: "5m ago", amount: "₹92,000", location: "Unknown proxy", status: "FRAUD" },
    { id: "TX1080", time: "8m ago", amount: "₹500", location: "Mumbai", status: "SAFE" },
  ]);

  const [markers, setMarkers] = useState([
    { id: 1, position: [40.7128, -74.0060], priority: "HIGH", location: "New York" },
    { id: 2, position: [51.5074, -0.1278], priority: "MEDIUM", location: "London" },
    { id: 3, position: [28.7041, 77.1025], priority: "HIGH", location: "Delhi" },
    { id: 4, position: [35.6762, 139.6503], priority: "MEDIUM", location: "Tokyo" }
  ]);

  const getCoordinates = (location) => {
    const locLower = location.toLowerCase();
    
    // Check for exact matches
    for (const [key, coords] of Object.entries(locationCoords)) {
      if (locLower.includes(key)) {
        return coords;
      }
    }
    
    // Generate random coordinates for unknown locations
    const lat = (Math.random() * 140) - 70; // Between -70 and 70
    const lng = (Math.random() * 360) - 180; // Between -180 and 180
    return [lat, lng];
  };

  useEffect(() => {
    // Establish live WebSockets stream
    const ws = new WebSocket("ws://127.0.0.1:8000/alerts/ws");
    
    ws.onopen = () => {
      console.log("WebSocket connected for map");
    };
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("Map WebSocket message:", message);
        
        if (message.type === "NEW_ALERT") {
          const loc = message.transaction.location;
          const coords = getCoordinates(loc);

          const newFeed = {
            id: `TX${message.transaction.id}`,
            time: "Just now",
            amount: `₹${message.transaction.amount.toLocaleString()}`,
            location: loc,
            status: message.transaction.status
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

          // Add map marker
          setMarkers(prev => [
            { 
              id: Date.now(), 
              position: coords, 
              priority: message.alert.priority,
              location: loc,
              transactionId: message.transaction.id,
              amount: message.transaction.amount
            },
            ...prev.slice(0, 15) // Keep latest 16 markers
          ]);
        }
      } catch (e) {
        console.error("Error reading map WS feed:", e);
      }
    };
    
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    
    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    // Periodic timer to update timestamps
    const timer = setInterval(() => {
      setLiveFeeds(prev => prev.map(f => {
        if (f.time === "Just now") return { ...f, time: "1m ago" };
        if (f.time.includes("m ago")) {
          const m = parseInt(f.time) + 1;
          return { ...f, time: `${m}m ago` };
        }
        return f;
      }));
    }, 60000);

    return () => {
      ws.close();
      clearInterval(timer);
    };
  }, []);

  const getMarkerColor = (priority) => {
    return priority === "HIGH" ? "#ef4444" : "#f59e0b";
  };

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
          <div className="table-card" style={{ padding: "0", minHeight: "500px", overflow: "hidden" }}>
            <MapContainer 
              center={[20, 0]} 
              zoom={2} 
              style={{ height: "500px", width: "100%" }}
              zoomControl={true}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              
              {markers.map((marker) => (
                <CircleMarker
                  key={marker.id}
                  center={marker.position}
                  radius={8}
                  pathOptions={{
                    color: getMarkerColor(marker.priority),
                    fillColor: getMarkerColor(marker.priority),
                    fillOpacity: 0.7,
                    weight: 2
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: "200px" }}>
                      <strong>Transaction #{marker.transactionId || marker.id}</strong>
                      <br />
                      Location: {marker.location}
                      <br />
                      Amount: ₹{marker.amount?.toLocaleString() || "N/A"}
                      <br />
                      Priority: <span style={{ color: getMarkerColor(marker.priority), fontWeight: "bold" }}>
                        {marker.priority}
                      </span>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
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
