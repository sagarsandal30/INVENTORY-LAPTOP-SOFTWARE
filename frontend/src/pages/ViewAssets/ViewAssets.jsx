import React, { useState, useEffect } from "react";
import "./ViewAssets.css";
import { Laptop, Package, Monitor, Calendar, Shield, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import Sidebar from "../../components/sideBar/SideBar";
import Navbar from "../../components/navBar/NavBar";
import { fetchMyAssets } from "./ViewAssetsAPI";

export default function ViewAssets() {
  const [assignedAssets, setAssignedAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchMyAssets();
      if (res.success) {
        setAssignedAssets(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.message || "Could not load your assets. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  return (
    <>
    <Navbar/>
    <Sidebar />
    <div className="view-assets-page">
      <div className="view-assets-header">
        <div className="view-assets-header-left">
          <h1>My Assigned Assets</h1>
          <p>View all laptops and software currently assigned to you</p>
        </div>
        <button className="va-refresh-btn" onClick={loadAssets} disabled={loading}>
          <RefreshCw size={18} className={loading ? "spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="va-error-alert">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="assets-container">
        <div className="assets-topbar">
          <div className="assets-count">
            Total Assigned Assets: <span>{assignedAssets.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="va-loader">
            <Loader2 size={40} className="spin" />
            <p>Fetching your assets...</p>
          </div>
        ) : assignedAssets.length === 0 ? (
          <div className="empty-state">
            <Package size={42} />
            <h3>No Assets Assigned</h3>
            <p>You currently do not have any assets assigned to your profile.</p>
          </div>
        ) : (
          <div className="assets-grid">
            {assignedAssets.map((asset) => (
              <div className="asset-card" key={asset.id}>
                <div className="asset-card-top">
                  <div className="asset-icon">
                    {asset.assetType === "Laptop" ? (
                      <Laptop size={22} />
                    ) : (
                      <Monitor size={22} />
                    )}
                  </div>

                  <span
                    className={`status-badge ${
                      asset.status === "Assigned" || asset.status === "Active"
                        ? "active"
                        : "inactive"
                    }`}
                  >
                    {asset.status}
                  </span>
                </div>

                <h3>{asset.assetName}</h3>

                <div className="asset-info">
                  <p>
                    <Shield size={16} />
                    <span>
                      <strong>Type:</strong> {asset.assetType}
                    </span>
                  </p>

                  <p>
                    <Package size={16} />
                    <span>
                      <strong>Serial / License:</strong> {asset.serialNumber}
                    </span>
                  </p>

                  <p>
                    <Calendar size={16} />
                    <span>
                      <strong>Assigned Date:</strong> {new Date(asset.assignedDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}
                    </span>
                  </p>
                </div>

                {/* <button className="view-details-btn">View Details</button> */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}