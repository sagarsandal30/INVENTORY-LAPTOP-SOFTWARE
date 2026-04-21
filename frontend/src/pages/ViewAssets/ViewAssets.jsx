import React from "react";
import "./ViewAssets.css";
import { Laptop, Package, Monitor, Calendar, Shield } from "lucide-react";
import Sidebar from "../../components/sideBar/SideBar";
import Navbar from "../../components/navBar/NavBar";

export default function ViewAssets() {
  // Dummy data for now
  const assignedAssets = [
    {
      id: 1,
      assetType: "Laptop",
      assetName: "Dell Latitude 5420",
      serialNumber: "DL-5420-001",
      assignedDate: "2026-04-10",
      status: "Assigned",
    },
    {
      id: 2,
      assetType: "Software",
      assetName: "Microsoft Office 365",
      serialNumber: "LIC-OFC-221",
      assignedDate: "2026-03-22",
      status: "Active",
    },
    {
      id: 3,
      assetType: "Software",
      assetName: "Slack Premium",
      serialNumber: "LIC-SLK-118",
      assignedDate: "2026-02-14",
      status: "Active",
    },
  ];

  return (
    <>
    <Navbar/>
    <Sidebar />
    <div className="view-assets-page">
      <div className="view-assets-header">
        <div>
          <h1>My Assigned Assets</h1>
          <p>View all laptops and software currently assigned to you</p>
        </div>
      </div>

      <div className="assets-container">
        <div className="assets-topbar">
          <div className="assets-count">
            Total Assigned Assets: <span>{assignedAssets.length}</span>
          </div>
        </div>

        {assignedAssets.length === 0 ? (
          <div className="empty-state">
            <Package size={42} />
            <h3>No Assets Assigned</h3>
            <p>You currently do not have any assets assigned.</p>
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
                      <strong>Assigned Date:</strong> {asset.assignedDate}
                    </span>
                  </p>
                </div>

                <button className="view-details-btn">View Details</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}