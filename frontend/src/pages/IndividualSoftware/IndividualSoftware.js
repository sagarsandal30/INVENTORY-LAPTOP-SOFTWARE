import { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Plus,
  Download,
  KeyRound,
  CheckCircle,
  Users,
  AlertCircle,
  XCircle,
  Clock,
  Edit,
  Trash2,
} from "lucide-react";
import "./IndividualSoftware.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function IndividualSoftware() {
  const [licenses, setLicenses] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [renewalFilter, setRenewalFilter] = useState("All");

  const fetchLicenses = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API_URL}/software-licenses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLicenses(res.data.data || []);
    } catch (error) {
      console.log("Error fetching licenses", error);
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  const getDaysLeft = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getRenewalStatus = (expiryDate) => {
    const daysLeft = getDaysLeft(expiryDate);

    if (daysLeft <= 0) return "Expired";
    if (daysLeft <= 30) return "Renewal Required Soon";
    if (daysLeft <= 60) return "Renewal Required in 60 Days";
    if (daysLeft <= 90) return "Renewal Required in 90 Days";

    return "Active";
  };

  const filteredLicenses = licenses.filter((item) => {
    const softwareName = item.softwareModelId?.softwareName || "";
    const licenseKey = item.licenseKey || "";
    const assignedUser = item.assignedTo?.fullName || "";

    const matchSearch =
      softwareName.toLowerCase().includes(search.toLowerCase()) ||
      licenseKey.toLowerCase().includes(search.toLowerCase()) ||
      assignedUser.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "All" || item.status === statusFilter;

    const currentRenewalStatus = getRenewalStatus(item.expiryDate);

    const matchRenewal =
      renewalFilter === "All" || currentRenewalStatus === renewalFilter;

    return matchSearch && matchStatus && matchRenewal;
  });

  const totalLicenses = licenses.length;
  const available = licenses.filter((l) => l.status === "Available").length;
  const assigned = licenses.filter((l) => l.status === "Assigned").length;
  const expired = licenses.filter(
    (l) => getRenewalStatus(l.expiryDate) === "Expired"
  ).length;
  const expiringSoon = licenses.filter((l) => {
    const daysLeft = getDaysLeft(l.expiryDate);
    return daysLeft > 0 && daysLeft <= 90;
  }).length;

  return (
    <div className="software-license-page">
      <div className="page-header">
        <div className="header-left">
          <div className="header-icon">
            <KeyRound size={30} />
          </div>

          <div>
            <h1>Software Licenses</h1>
            <p>Manage individual software licenses with expiry tracking</p>
          </div>
        </div>

        <div className="header-actions">
          <button className="export-btn">
            <Download size={18} />
            Export
          </button>

          <button className="add-btn">
            <Plus size={18} />
            Add License
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <KeyRound size={24} />
          </div>
          <div>
            <h4>{totalLicenses}</h4>
            <p>Total Licenses</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <CheckCircle size={24} />
          </div>
          <div>
            <h4>{available}</h4>
            <p>Available</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <Users size={24} />
          </div>
          <div>
            <h4>{assigned}</h4>
            <p>Assigned</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <Clock size={24} />
          </div>
          <div>
            <h4>{expiringSoon}</h4>
            <p>Expiring Soon</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <XCircle size={24} />
          </div>
          <div>
            <h4>{expired}</h4>
            <p>Expired</p>
          </div>
        </div>
      </div>

      <div className="filter-row">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by software, license key, or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Available">Available</option>
          <option value="Assigned">Assigned</option>
          <option value="Revoked">Revoked</option>
          <option value="Expired">Expired</option>
        </select>

        <select
          value={renewalFilter}
          onChange={(e) => setRenewalFilter(e.target.value)}
        >
          <option value="All">All Renewal</option>
          <option value="Active">Active</option>
          <option value="Renewal Required in 90 Days">90 Days</option>
          <option value="Renewal Required in 60 Days">60 Days</option>
          <option value="Renewal Required Soon">30 Days</option>
          <option value="Expired">Expired</option>
        </select>

        <span className="result-count">{filteredLicenses.length} results</span>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Software Name</th>
              <th>License Key</th>
              <th>License Type</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Device</th>
              <th>Expiry Date</th>
              <th>Renewal Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredLicenses.length > 0 ? (
              filteredLicenses.map((item) => {
                const renewalStatus = getRenewalStatus(item.expiryDate);
                const daysLeft = getDaysLeft(item.expiryDate);

                return (
                  <tr key={item._id}>
                    <td>{item.softwareModelId?.softwareName || "N/A"}</td>

                    <td>{item.licenseKey}</td>

                    <td>{item.softwareModelId?.licenseType || "N/A"}</td>

                    <td>
                      <span className={`badge ${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>

                    <td>{item.assignedTo?.fullName || "Not Assigned"}</td>

                    <td>{item.assignedDevice || "N/A"}</td>

                    <td>{new Date(item.expiryDate).toLocaleDateString()}</td>

                    <td>
                      <span
                        className={`badge ${
                          renewalStatus === "Expired"
                            ? "expired"
                            : daysLeft <= 30
                            ? "danger"
                            : daysLeft <= 90
                            ? "warning"
                            : "active"
                        }`}
                      >
                        {renewalStatus}
                      </span>
                    </td>

                    <td>
                      <button className="action-btn edit">
                        <Edit size={16} />
                      </button>

                      <button className="action-btn delete">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9">
                  <div className="empty-state">
                    <AlertCircle size={40} />
                    <h3>No software licenses found</h3>
                    <p>Try adjusting your filters or add a new license</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}