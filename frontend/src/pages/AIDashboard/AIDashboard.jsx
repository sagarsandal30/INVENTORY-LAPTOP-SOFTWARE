import React, { useEffect, useState } from "react";
import Navbar from "../../components/navBar/NavBar";
import Sidebar from "../../components/sideBar/SideBar";
import { 
  BrainCircuit, 
  AlertTriangle, 
  TrendingDown, 
  Activity, 
  ShieldCheck, 
  Search,
  RefreshCw,
  Info
} from "lucide-react";
import { getHighRiskLaptops, getBrandFailureAnalysis, predictFailure } from "../../API/aiApi";
import "./AIDashboard.css";

const AIDashboard = () => {
  const [highRiskLaptops, setHighRiskLaptops] = useState([]);
  const [brandAnalysis, setBrandAnalysis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [highRiskData, brandData] = await Promise.all([
        getHighRiskLaptops(),
        getBrandFailureAnalysis()
      ]);
      setHighRiskLaptops(highRiskData.data || []);
      setBrandAnalysis(brandData.data || []);
    } catch (err) {
      setError(err.message || "Failed to load AI data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePredict = async (assetId) => {
    setPredicting(assetId);
    setMessage(null);
    try {
      const result = await predictFailure(assetId);
      setMessage({ type: "success", text: `Analysis complete! Risk Level: ${result.data.riskLevel}` });
      fetchData(); // Refresh lists
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Prediction failed" });
    } finally {
      setPredicting(null);
    }
  };

  const getRiskBadgeClass = (level) => {
    switch (level) {
      case "Critical": return "badge-critical";
      case "High": return "badge-high";
      case "Medium": return "badge-medium";
      case "Low": return "badge-low";
      default: return "";
    }
  };

  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="ai-dashboard">
        <div className="ai-header">
          <div className="header-info">
            <div className="header-icon-box">
              <BrainCircuit size={28} />
            </div>
            <div>
              <h1>AI Predictive Maintenance</h1>
              <p>Advanced hardware failure risk analysis powered by AI.</p>
            </div>
          </div>
          <button className="refresh-btn" onClick={fetchData} disabled={loading}>
            <RefreshCw size={18} className={loading ? "spin" : ""} />
            Refresh Data
          </button>
        </div>

        {message && (
          <div className={`status-message ${message.type}`}>
            <Info size={20} />
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)}>&times;</button>
          </div>
        )}

        <div className="ai-stats-grid">
          <div className="ai-stat-card">
            <div className="stat-icon-wrapper high">
              <AlertTriangle size={24} />
            </div>
            <div className="stat-details">
              <h3>{highRiskLaptops.length}</h3>
              <p>At-Risk Laptops</p>
            </div>
          </div>
          <div className="ai-stat-card">
            <div className="stat-icon-wrapper trend">
              <TrendingDown size={24} />
            </div>
            <div className="stat-details">
              <h3>{brandAnalysis.length > 0 ? (brandAnalysis[0].failureRate * 100).toFixed(1) : 0}%</h3>
              <p>Highest Brand Failure Rate</p>
            </div>
          </div>
          <div className="ai-stat-card">
            <div className="stat-icon-wrapper activity">
              <Activity size={24} />
            </div>
            <div className="stat-details">
              <h3>Auto-Scan</h3>
              <p>Enabled (Weekly)</p>
            </div>
          </div>
        </div>

        <div className="ai-main-grid">
          {/* High Risk Laptops Table */}
          <div className="ai-card">
            <div className="card-header">
              <h2>High & Critical Risk Assets</h2>
              <div className="card-badge danger">{highRiskLaptops.length} Assets</div>
            </div>
            <div className="table-container">
              {loading ? (
                <div className="loader-box">Scanning assets...</div>
              ) : highRiskLaptops.length === 0 ? (
                <div className="empty-box">No high-risk laptops detected.</div>
              ) : (
                <table className="ai-table">
                  <thead>
                    <tr>
                      <th>Serial Number</th>
                      <th>Model / Brand</th>
                      <th>Risk Level</th>
                      <th>AI Score</th>
                      <th>Last Analysis</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {highRiskLaptops.map((laptop) => (
                      <tr key={laptop._id}>
                        <td><strong>{laptop.serialNumber}</strong></td>
                        <td>
                          <div className="model-info">
                            {laptop.laptopModelId?.modelName}
                            <span>{laptop.laptopModelId?.brand}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`risk-badge ${getRiskBadgeClass(laptop.aiMetrics?.riskLevel)}`}>
                            {laptop.aiMetrics?.riskLevel}
                          </span>
                        </td>
                        <td>
                          <div className="score-bar-wrapper">
                            <div className="score-bar">
                              <div 
                                className="score-fill" 
                                style={{ width: `${laptop.aiMetrics?.predictionScore}%`, backgroundColor: laptop.aiMetrics?.predictionScore > 70 ? '#ef4444' : '#f59e0b' }}
                              ></div>
                            </div>
                            <span>{laptop.aiMetrics?.predictionScore}%</span>
                          </div>
                        </td>
                        <td>{new Date(laptop.aiMetrics?.lastPredictionDate).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="predict-btn-small" 
                            onClick={() => handlePredict(laptop._id)}
                            disabled={predicting === laptop._id}
                          >
                            {predicting === laptop._id ? "Analysing..." : "Re-Predict"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Brand Analysis */}
          <div className="ai-card">
            <div className="card-header">
              <h2>Brand Reliability Analysis</h2>
            </div>
            <div className="table-container">
              {loading ? (
                <div className="loader-box">Calculating reliability...</div>
              ) : (
                <table className="ai-table">
                  <thead>
                    <tr>
                      <th>Brand</th>
                      <th>Total Units</th>
                      <th>Total Repairs</th>
                      <th>Failure Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brandAnalysis.map((brand, index) => (
                      <tr key={index}>
                        <td><strong>{brand.brand}</strong></td>
                        <td>{brand.totalLaptops}</td>
                        <td>{brand.totalRepairs}</td>
                        <td>
                          <div className="rate-display">
                            <div className="rate-circle">
                              <svg viewBox="0 0 36 36">
                                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path 
                                  className="circle" 
                                  strokeDasharray={`${(brand.failureRate * 100).toFixed(0)}, 100`} 
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                />
                              </svg>
                              <span>{(brand.failureRate * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIDashboard;
