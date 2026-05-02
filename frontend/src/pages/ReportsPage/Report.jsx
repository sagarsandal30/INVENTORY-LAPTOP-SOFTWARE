import { useState, useEffect, useMemo } from "react";
import "./Report.css";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  Filter,
  FileText,
  Laptop,
  Package,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  PieChart,
  Activity,
  Zap,
  RefreshCw,
  Loader2,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="reports-chart-tooltip">
        <span className="reports-tooltip-title">{label}</span>
        {payload.map((entry, index) => (
          <div key={index} className="reports-tooltip-item">
            <div className="reports-tooltip-dot" style={{ background: entry.color }}></div>
            <span className="reports-tooltip-label">{entry.name}</span>
            <span className="reports-tooltip-value">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomLegend = (props) => {
  const { payload } = props;
  return (
    <div className="reports-custom-legend">
      {payload.map((entry, index) => (
        <div key={`item-${index}`} className="reports-legend-pill">
          <div className="reports-legend-dot" style={{ background: entry.color }}></div>
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

import Navbar from "../../components/navBar/NavBar";
import Sidebar from "../../components/sideBar/SideBar";
import { fetchReportData } from "./ReportAPI";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Report = () => {
  const [selectedReport, setSelectedReport] = useState("overview");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    const loadReportData = async () => {
      try {
        setLoading(true);
        const res = await fetchReportData();
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError(err.message || "Failed to load reports");
        showToast(err.message || "Connection error", "error");
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, []);

  const downloadPDF = (title, headers, body, fileName) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    autoTable(doc, {
      startY: 28,
      head: [headers],
      body: body,
      theme: "grid",
      headStyles: { fillColor: [99, 102, 241] }, // Indigo-500
    });

    doc.save(fileName);
  };

  const downloadJSON = (jsonData, fileName) => {
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = (reportType) => {
    showToast(`Generating ${reportType} report...`);
    
    try {
      if (reportType === "complete") {
        downloadJSON(data, "complete_report.json");
      } else if (reportType === "assignment-history") {
        const headers = ["Month", "Laptops Assigned", "Software Licenses"];
        const body = data.assignmentHistory.map(item => [item.month, item.laptops, item.software]);
        downloadPDF("Assignment History Report", headers, body, "assignment_history.pdf");
      } else if (reportType === "lifecycle") {
        const headers = ["Asset Name", "Purchase Date", "Age (Months)", "Assigned To", "Condition", "Status"];
        const body = data.lifecycleData.map(item => {
          const d = new Date(item.purchaseDate).toLocaleDateString("en-GB");
          return [item.assetName, d, item.age, item.assignedTo, item.condition, item.status];
        });
        downloadPDF("Laptop Lifecycle Report", headers, body, "lifecycle_report.pdf");
      } else if (reportType === "software-expiry") {
        const headers = ["Software", "Vendor", "Expiry Date", "Assigned To", "Days Left", "Status"];
        const body = data.softwareExpiry.map(item => {
          const d = new Date(item.expiryDate).toLocaleDateString("en-GB");
          return [item.name, item.vendor, d, item.assignedTo, item.daysLeft, item.status];
        });
        downloadPDF("Software Expiry Report", headers, body, "software_expiry_report.pdf");
      } else if (reportType === "forecast") {
        const headers = ["Year", "Est. Employees", "Est. Laptops", "Est. Software"];
        const body = [0, 1, 2, 3].map(i => {
          const year = new Date().getFullYear() + i;
          const multiplier = Math.pow(1.05, i);
          const emp = Math.round(100 * multiplier);
          const lap = Math.round(data.stats.totalAssets * 0.8 * multiplier);
          const soft = Math.round(data.stats.totalAssets * 0.2 * multiplier);
          return [year, emp, lap, soft];
        });
        downloadPDF("Growth Forecast Report", headers, body, "growth_forecast.pdf");
      }
      setTimeout(() => showToast(`${reportType} report exported successfully!`, "success"), 500);
    } catch (err) {
      showToast(`Failed to export ${reportType} report`, "error");
    }
  };

  const getLifecycleStatusColor = (status) => {
    const colors = {
      Active: { bg: "#d1fae5", color: "#10b981" },
      "Replace Soon": { bg: "#fef3c7", color: "#f59e0b" },
      Expired: { bg: "#fee2e2", color: "#ef4444" },
    };
    return colors[status] || colors.Active;
  };

  const getSoftwareStatusColor = (status) => {
    const colors = {
      Active: { bg: "#d1fae5", color: "#10b981" },
      Upcoming: { bg: "#fef3c7", color: "#f59e0b" },
      Critical: { bg: "#fee2e2", color: "#ef4444" },
      Expired: { bg: "#f1f5f9", color: "#8892a4" },
    };
    return colors[status] || colors.Active;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Sidebar />
        <div className="reports-page reports-page--loading">
          <Loader2 size={40} className="reports-spinner" />
          <p>Generating real-time analytics...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <Sidebar />
        <div className="reports-page reports-page--error">
          <AlertTriangle size={50} color="#ef4444" />
          <h2>Report Generation Failed</h2>
          <p>{error}</p>
          <button className="reports-btn reports-btn--primary" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </>
    );
  }

  const { stats, lifecycleData, softwareExpiry, departmentAllocation, assignmentHistory } = data;

  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="reports-page">
        {toast && (
          <div className={`reports-toast reports-toast--${toast.type}`}>
            {toast.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            <span>{toast.msg}</span>
          </div>
        )}

        <div className="reports-header">
          <div className="reports-header-left">
            <div className="reports-header-icon">
              <BarChart3 size={26} />
            </div>
            <div>
              <h1 className="reports-title">Reports & Forecasting</h1>
              <p className="reports-subtitle">Live analytics, lifecycle tracking, and growth projections</p>
            </div>
          </div>
          <div className="reports-header-right">
            <button className="reports-btn reports-btn--outline" onClick={() => handleExport("complete")}>
              <Download size={16} /> Export Report
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="reports-stats">
          <div className="reports-stat-card">
            <div className="reports-stat-icon" style={{ background: "rgba(99,102,241,0.12)", color: "#6366F1" }}>
              <Activity size={22} />
            </div>
            <div>
              <div className="reports-stat-value">{stats.totalAssets}</div>
              <div className="reports-stat-label">Total Assets</div>
            </div>
          </div>
          <div className="reports-stat-card">
            <div className="reports-stat-icon" style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}>
              <CheckCircle size={22} />
            </div>
            <div>
              <div className="reports-stat-value">{stats.activeAssignments}</div>
              <div className="reports-stat-label">Active Assignments</div>
            </div>
          </div>
          <div className="reports-stat-card">
            <div className="reports-stat-icon" style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <div className="reports-stat-value">{stats.expiringLicenses}</div>
              <div className="reports-stat-label">Expiring Soon</div>
            </div>
          </div>
          <div className="reports-stat-card">
            <div className="reports-stat-icon" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>
              <RefreshCw size={22} />
            </div>
            <div>
              <div className="reports-stat-value">{stats.replacementDue}</div>
              <div className="reports-stat-label">Replacement Due</div>
            </div>
          </div>
          <div className="reports-stat-card">
            <div className="reports-stat-icon" style={{ background: "rgba(99,102,241,0.12)", color: "#6366f1" }}>
              <TrendingUp size={22} />
            </div>
            <div>
              <div className="reports-stat-value">{stats.avgUtilization}%</div>
              <div className="reports-stat-label">Avg Utilization</div>
            </div>
          </div>
          <div className="reports-stat-card">
            <div className="reports-stat-icon" style={{ background: "rgba(139,92,246,0.12)", color: "#8b5cf6" }}>
              <Zap size={22} />
            </div>
            <div>
              <div className="reports-stat-value">{stats.forecastGrowth}%</div>
              <div className="reports-stat-label">Yearly Growth</div>
            </div>
          </div>
        </div>

        {/* Report Tabs */}
        <div className="reports-tabs">
          <button className={`reports-tab ${selectedReport === "overview" ? "reports-tab--active" : ""}`} onClick={() => setSelectedReport("overview")}>
            <PieChart size={18} />
            Overview
          </button>
          <button className={`reports-tab ${selectedReport === "lifecycle" ? "reports-tab--active" : ""}`} onClick={() => setSelectedReport("lifecycle")}>
            <Clock size={18} />
            Lifecycle
          </button>
          <button className={`reports-tab ${selectedReport === "software" ? "reports-tab--active" : ""}`} onClick={() => setSelectedReport("software")}>
            <Package size={18} />
            Software Expiry
          </button>
          <button className={`reports-tab ${selectedReport === "forecast" ? "reports-tab--active" : ""}`} onClick={() => setSelectedReport("forecast")}>
            <TrendingUp size={18} />
            Growth Forecast
          </button>
          <button className={`reports-tab ${selectedReport === "utilization" ? "reports-tab--active" : ""}`} onClick={() => setSelectedReport("utilization")}>
            <Activity size={18} />
            Utilization
          </button>
        </div>

        {/* Overview Tab */}
        {selectedReport === "overview" && (
          <div className="reports-content">
            <div className="reports-grid">
              {/* Assignment History Chart */}
              <div className="reports-card reports-card--full">
                <div className="reports-card-header">
                  <div>
                    <h3 className="reports-card-title">Assignment History</h3>
                    <p className="reports-card-subtitle">Last 6 months trend analysis</p>
                  </div>
                  <button className="reports-btn-icon" onClick={() => handleExport("assignment-history")}>
                    <Download size={16} />
                  </button>
                </div>
                <div className="reports-chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={assignmentHistory}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorLaptops" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSoftware" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="laptops"
                        name="Laptops Assigned"
                        stroke="#6366f1"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorLaptops)"
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="software"
                        name="Software Licenses"
                        stroke="#ec4899"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorSoftware)"
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                      <Legend content={<CustomLegend />} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Department Allocation */}
              <div className="reports-card">
                <div className="reports-card-header">
                  <div>
                    <h3 className="reports-card-title">Department Allocation</h3>
                    <p className="reports-card-subtitle">Assets by department</p>
                  </div>
                </div>
                <div className="reports-table-simple">
                  {departmentAllocation.slice(0, 5).map((dept) => (
                    <div key={dept.department} className="reports-dept-row">
                      <div className="reports-dept-name">{dept.department}</div>
                      <div className="reports-dept-stats">
                        <span className="reports-dept-stat">
                          <Laptop size={12} /> {dept.laptops}
                        </span>
                        <span className="reports-dept-stat">
                          <Package size={12} /> {dept.software}
                        </span>
                      </div>
                    </div>
                  ))}
                  {departmentAllocation.length === 0 && <p className="reports-empty">No department data</p>}
                </div>
              </div>

              {/* Asset Utilization */}
              <div className="reports-card">
                <div className="reports-card-header">
                  <div>
                    <h3 className="reports-card-title">Asset Utilization</h3>
                    <p className="reports-card-subtitle">Current usage rates</p>
                  </div>
                </div>
                <div className="reports-utilization">
                  <div className="reports-util-item">
                    <div className="reports-util-header">
                      <span className="reports-util-label">System-wide Utilization</span>
                      <span className="reports-util-pct">{stats.avgUtilization}%</span>
                    </div>
                    <div className="reports-util-bar-bg">
                      <div className="reports-util-bar-fill" style={{ width: `${stats.avgUtilization}%` }}></div>
                    </div>
                    <div className="reports-util-stats">
                      <span>{stats.activeAssignments} Assigned</span>
                      <span>·</span>
                      <span>{stats.totalAssets - stats.activeAssignments} Available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lifecycle Tab */}
        {selectedReport === "lifecycle" && (
          <div className="reports-content">
            <div className="reports-card">
              <div className="reports-card-header">
                <div>
                  <h3 className="reports-card-title">Laptop Lifecycle Tracking</h3>
                  <p className="reports-card-subtitle">3-year replacement policy monitoring</p>
                </div>
                <button className="reports-btn-icon" onClick={() => handleExport("lifecycle")}>
                  <Download size={16} />
                </button>
              </div>
              <div className="reports-table-wrap">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Asset Name</th>
                      <th>Purchase Date</th>
                      <th>Age (Months)</th>
                      <th>Assigned To</th>
                      <th>Condition</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lifecycleData.map((item) => {
                      const statusColor = getLifecycleStatusColor(item.status);
                      return (
                        <tr key={item.id}>
                          <td>
                            <div className="reports-asset-cell">
                              <Laptop size={16} />
                              <strong>{item.assetName}</strong>
                            </div>
                          </td>
                          <td>
                            <div className="reports-date">
                              <Calendar size={13} />
                              {new Date(item.purchaseDate).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          </td>
                          <td>
                            <span className="reports-age">{item.age} months</span>
                          </td>
                          <td>{item.assignedTo}</td>
                          <td>
                            <span className="reports-condition">{item.condition}</span>
                          </td>
                          <td>
                            <span className="reports-status-badge" style={{ background: statusColor.bg, color: statusColor.color }}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {lifecycleData.length === 0 && (
                       <tr><td colSpan="6" className="reports-empty">No lifecycle data found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Software Expiry Tab */}
        {selectedReport === "software" && (
          <div className="reports-content">
            <div className="reports-card">
              <div className="reports-card-header">
                <div>
                  <h3 className="reports-card-title">Software License Expiry</h3>
                  <p className="reports-card-subtitle">Renewal alerts (30/60/90 days)</p>
                </div>
                <button className="reports-btn-icon" onClick={() => handleExport("software-expiry")}>
                  <Download size={16} />
                </button>
              </div>
              <div className="reports-table-wrap">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Software</th>
                      <th>Vendor</th>
                      <th>Expiry Date</th>
                      <th>Assigned To</th>
                      <th>Days Left</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {softwareExpiry.map((item) => {
                      const statusColor = getSoftwareStatusColor(item.status);
                      return (
                        <tr key={item.id}>
                          <td>
                            <div className="reports-asset-cell">
                              <Package size={16} />
                              <strong>{item.name}</strong>
                            </div>
                          </td>
                          <td>{item.vendor}</td>
                          <td>
                            <div className="reports-date">
                              <Calendar size={13} />
                              {new Date(item.expiryDate).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          </td>
                          <td>{item.assignedTo}</td>
                          <td>
                            <span className={`reports-days-left ${item.daysLeft <= 30 ? "reports-days-left--critical" : item.daysLeft <= 90 ? "reports-days-left--warning" : ""}`}>
                              {item.daysLeft > 0 ? `${item.daysLeft} days` : "Expired"}
                            </span>
                          </td>
                          <td>
                            <span className="reports-status-badge" style={{ background: statusColor.bg, color: statusColor.color }}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {softwareExpiry.length === 0 && (
                       <tr><td colSpan="5" className="reports-empty">No expiring licenses found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Growth Forecast Tab */}
        {selectedReport === "forecast" && (
          <div className="reports-content">
            <div className="reports-card">
              <div className="reports-card-header">
                <div>
                  <h3 className="reports-card-title">3-Year Growth Forecast</h3>
                  <p className="reports-card-subtitle">5% annual growth projection</p>
                </div>
                <button className="reports-btn-icon" onClick={() => handleExport("forecast")}>
                  <Download size={16} />
                </button>
              </div>
              <div className="reports-forecast-table">
                <div className="reports-forecast-row reports-forecast-row--header">
                  <div>Year</div>
                  <div>Est. Employees</div>
                  <div>Est. Laptops</div>
                  <div>Est. Software</div>
                </div>
                {[0, 1, 2, 3].map((i) => {
                   const year = new Date().getFullYear() + i;
                   const multiplier = Math.pow(1.05, i);
                   return (
                    <div key={year} className={`reports-forecast-row ${i === 0 ? "reports-forecast-row--current" : ""}`}>
                      <div className="reports-forecast-year">
                        {year}
                        {i === 0 && <span className="reports-forecast-badge">Current</span>}
                      </div>
                      <div>{Math.round(100 * multiplier)}</div>
                      <div>{Math.round(stats.totalAssets * 0.8 * multiplier)}</div>
                      <div>{Math.round(stats.totalAssets * 0.2 * multiplier)}</div>
                    </div>
                   );
                })}
              </div>
              <div className="reports-forecast-note">
                <AlertTriangle size={16} />
                <span>Based on 5% annual employee growth rate and current asset allocation ratios</span>
              </div>
            </div>
          </div>
        )}

        {/* Utilization Tab */}
        {selectedReport === "utilization" && (
          <div className="reports-content">
            <div className="reports-grid">
              <div className="reports-card">
                <div className="reports-card-header">
                  <div>
                    <h3 className="reports-card-title">Detailed Utilization</h3>
                    <p className="reports-card-subtitle">Asset usage breakdown</p>
                  </div>
                </div>
                <div className="reports-utilization-detail">
                    <div className="reports-util-detail-card">
                      <h4 className="reports-util-detail-title">System-wide Utilization</h4>
                      <div className="reports-util-detail-grid">
                        <div className="reports-util-detail-item">
                          <span className="reports-util-detail-label">Total Assets</span>
                          <span className="reports-util-detail-value">{stats.totalAssets}</span>
                        </div>
                        <div className="reports-util-detail-item">
                          <span className="reports-util-detail-label">In Use</span>
                          <span className="reports-util-detail-value" style={{ color: "#10b981" }}>
                            {stats.activeAssignments}
                          </span>
                        </div>
                        <div className="reports-util-detail-item">
                          <span className="reports-util-detail-label">Available</span>
                          <span className="reports-util-detail-value" style={{ color: "#6366f1" }}>
                            {stats.totalAssets - stats.activeAssignments}
                          </span>
                        </div>
                        <div className="reports-util-detail-item">
                          <span className="reports-util-detail-label">Utilization</span>
                          <span className="reports-util-detail-value" style={{ color: "#8b5cf6", fontSize: "20px" }}>
                            {stats.avgUtilization}%
                          </span>
                        </div>
                      </div>
                    </div>
                </div>
              </div>

              <div className="reports-card">
                <div className="reports-card-header">
                  <div>
                    <h3 className="reports-card-title">Top Departments</h3>
                    <p className="reports-card-subtitle">By total asset count</p>
                  </div>
                </div>
                <div className="reports-dept-ranking">
                  {departmentAllocation.sort((a, b) => b.laptops + b.software - (a.laptops + a.software))
                    .slice(0, 5)
                    .map((dept, idx) => (
                      <div key={dept.department} className="reports-dept-rank-item">
                        <span className="reports-dept-rank-num">{idx + 1}</span>
                        <div className="reports-dept-rank-info">
                          <span className="reports-dept-rank-name">{dept.department}</span>
                          <span className="reports-dept-rank-count">{dept.laptops + dept.software} assets</span>
                        </div>
                      </div>
                    ))}
                  {departmentAllocation.length === 0 && <p className="reports-empty">No department ranking data</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Report;
