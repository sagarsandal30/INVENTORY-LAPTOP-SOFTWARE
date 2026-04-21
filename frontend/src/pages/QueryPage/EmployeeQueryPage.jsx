// src/pages/employee/EmployeeQueriesPage.jsx
import { useState } from "react";
import QueryForm from "../../components/EmployeeQuery/QueryForm";
import QueryList from "../../components/EmployeeQuery/QueryList";
import "./EmployeeQueryPage.css";
import Navbar from "../../components/navBar/NavBar";
import Sidebar from "../../components/sideBar/SideBar";

const TABS = [
  {
    id: "new",
    label: "New Query",
    icon: (
      <svg className="tab-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
    ),
  },
  {
    id: "list",
    label: "My Queries",
    icon: (
      <svg className="tab-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0
             00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2
             2 0 012 2"
        />
      </svg>
    ),
  },
];

export default function EmployeeQueriesPage() {
  const [activeTab, setActiveTab] = useState("new");
  const [listKey, setListKey] = useState(0);

  const handleQuerySuccess = () => {
    setActiveTab("list");
    setListKey((k) => k + 1);
  };

  return (
    <>
    <Navbar/>
    <Sidebar></Sidebar>
    <div className="employee-queries-page">
      {/* Page Header */}
      <div className="employee-queries-header">
        <div className="employee-queries-header-inner">
          <div className="employee-queries-title-wrap">
            <div className="employee-queries-icon-box">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863
                     9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574
                     3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div>
              <h1 className="employee-queries-title">IT Support &amp; Queries</h1>
              <p className="employee-queries-subtitle">
                Submit requests, track status, and view IT responses
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="employee-queries-container">
        {/* Info Banner */}
        <div className="employee-queries-banner">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012
                 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="employee-queries-banner-title">How it works</p>
            <p className="employee-queries-banner-text">
              Submit your query below. You'll receive a confirmation email instantly,
              and our IT team will be notified. Expected response time is 1–2 business days.
              You can track your query status in the "My Queries" tab.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="employee-queries-card">
          {/* Tabs */}
          <div className="employee-queries-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`employee-queries-tab-btn ${
                  activeTab === tab.id ? "active" : ""
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="employee-queries-content">
            {activeTab === "new" && <QueryForm onSuccess={handleQuerySuccess} />}
            {activeTab === "list" && <QueryList key={listKey} />}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}