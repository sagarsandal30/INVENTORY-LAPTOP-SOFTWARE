import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  Search,
  Download,
  AlertCircle,
  KeyRound,
  CheckCircle,
  Users,
  Clock,
  Package,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShieldCheck,
  Monitor,
  X,
  Plus,
  Calendar,
  Filter,
  Eye,
} from "lucide-react";

import "./IndividualSoftware.css";
import { APIRoutes } from "../../../API/ApiRoutes";
import Navbar from "../../components/navBar/NavBar";
import Sidebar from "../../components/sideBar/SideBar";

const API_URL = import.meta.env.VITE_API_URL;

const EMPTY_FORM = {
  licenseKey: "",
  status: "Available",
  expiryDate: "",
  assignedTo: "",
  assignedDevice: "",
};

export default function IndividualSoftware() {
  const { softwareId } = useParams();

  const [licenses, setLicenses] = useState([]);
  const [stats, setStats] = useState({});
  const [softwareInfo, setSoftwareInfo] = useState(null);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [renewalFilter, setRenewalFilter] = useState("All");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getTokenConfig = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_URL}${APIRoutes.AVALIABLE_EMPLOYEE}`, getTokenConfig());
      setEmployees(res.data.data || []);
    } catch (err) {
      console.log("Error fetching employees", err);
    }
  };

  const fetchLicenses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(`${API_URL}${APIRoutes.SOFTWARE_LICENSE}`, {
        ...getTokenConfig(),
        params: {
          softwareModelId: softwareId,
          statusFilter: statusFilter !== "All" ? statusFilter : undefined,
          search: search.trim() || undefined,
        },
      });

      const payload = res.data?.data || res.data;
      const licenseList = payload?.existingSoftware || payload?.licenses || payload?.softwareLicenses || [];

      setLicenses(licenseList);
      setStats(payload?.stats || {});

      if (payload?.software) {
        setSoftwareInfo(payload.software);
      } else if (licenseList.length > 0) {
        const first = licenseList[0];
        setSoftwareInfo(first.softwareModelId || first.softwareId || first.software || null);
      }
    } catch (error) {
      console.log("Error fetching licenses", error);
      setError(error?.response?.data?.message || "Failed to fetch software licenses");
    } finally {
      setLoading(false);
    }
  }, [softwareId, statusFilter, search]);

  useEffect(() => {
    if (softwareId) {
      fetchLicenses();
      fetchEmployees();
    }
  }, [fetchLicenses, softwareId]);

  const handleOpenAdd = () => {
    setEditItem(null);
    setFormData({ ...EMPTY_FORM, softwareModelId: softwareId });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditItem(item);
    setFormData({
      licenseKey: item.licenseKey,
      status: item.status,
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : "",
      assignedTo: item.assignedTo?._id || item.assignedTo || "",
      assignedDevice: item.assignedDevice || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.licenseKey.trim()) return showToast("License key is required", "error");

    const submitData = { ...formData };
    if (!submitData.assignedTo || submitData.status !== "Assigned") submitData.assignedTo = null;
    if (!submitData.expiryDate) submitData.expiryDate = null;

    if (submitData.expiryDate) {
      const status = getRenewalStatus(submitData.expiryDate);
      submitData.renewalStatus = (status === "Critical" || status === "Expiring Soon") ? "Expiring Soon" : (status === "Expired" ? "Expired" : "Active");
    }

    try {
      setSubmitting(true);
      if (editItem) {
        await axios.put(`${API_URL}${APIRoutes.SOFTWARE_LICENSE}/${editItem._id}`, submitData, getTokenConfig());
        showToast("License updated successfully");
      } else {
        await axios.post(`${API_URL}${APIRoutes.SOFTWARE_LICENSE}`, { ...submitData, softwareModelId: softwareId }, getTokenConfig());
        showToast("License added successfully");
      }
      setShowModal(false);
      fetchLicenses();
    } catch (err) {
      showToast(err.response?.data?.message || "Operation failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      await axios.delete(`${API_URL}${APIRoutes.SOFTWARE_LICENSE}/${deleteConfirm._id}`, getTokenConfig());
      showToast("License deleted successfully");
      setDeleteConfirm(null);
      fetchLicenses();
    } catch (err) {
      showToast("Failed to delete license", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const getDaysLeft = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    if (Number.isNaN(expiry.getTime())) return null;
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getRenewalStatus = (expiryDate) => {
    const daysLeft = getDaysLeft(expiryDate);
    if (daysLeft === null) return "N/A";
    if (daysLeft <= 0) return "Expired";
    if (daysLeft <= 30) return "Critical";
    if (daysLeft <= 90) return "Expiring Soon";
    return "Active";
  };

  const getBadgeClass = (status, type = "status") => {
    const val = status?.toLowerCase() || "";
    if (type === "status") {
      if (val === "available" || val === "active") return "isl-badge--available";
      if (val === "assigned") return "isl-badge--assigned";
      return "isl-badge--expired";
    } else {
      if (val === "active") return "isl-badge--active";
      if (val === "expired" || val === "critical") return "isl-badge--expired";
      return "isl-badge--warning";
    }
  };

  const filteredLicenses = licenses.filter((item) => {
    if (renewalFilter === "All") return true;
    const status = getRenewalStatus(item.expiryDate);
    if (renewalFilter === "Expiring Soon") return status === "Expiring Soon" || status === "Critical";
    return status === renewalFilter;
  });

  const softwareName = softwareInfo?.softwareName || "Software Licenses";
  const vendor = softwareInfo?.vendor || "InventoryHub";
  const initials = softwareName.charAt(0).toUpperCase();

  const getEmployeeName = (assignedTo) => {
    if (!assignedTo) return "Unassigned";

    // If assignedTo is already populated (object)
    if (typeof assignedTo === "object" && assignedTo.fullName) {
      return assignedTo.fullName;
    }

    // Lookup in employees list
    const employee = employees.find(
      (e) => e._id === (assignedTo._id || assignedTo),
    );
    return employee ? employee.fullName : "Unknown Employee";
  };

  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="isl-root">
        {toast && (
          <div className={`isl-toast ${toast.type === "error" ? "isl-toast--error" : ""}`}>
            {toast.type === "success" ? <CheckCircle size={18} color="#10b981" /> : <AlertCircle size={18} color="#ef4444" />}
            <span>{toast.message}</span>
          </div>
        )}

        <main className="isl-main">
          {/* Header */}
          <div className="isl-header">
            <div className="isl-header-left">
              <div className="isl-header-icon">
                <Package size={28} />
              </div>
              <div className="isl-title-wrap">
                <h1>{softwareName} Licenses</h1>
                <p>Manage software inventory, licenses & renewals</p>
              </div>
            </div>
            <div className="isl-header-right">
              <button className="isl-btn isl-btn-outline"><Download size={16} /> Export</button>
              <button className="isl-btn isl-btn-primary" onClick={handleOpenAdd}><Plus size={16} /> Add License</button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="isl-stats-grid">
            <div className="isl-stat-card">
              <div className="isl-stat-icon-wrap" style={{ background: "#f5f3ff", color: "#7c3aed" }}><Package size={20} /></div>
              <div className="isl-stat-info">
                <h4>{stats.total || licenses.length}</h4>
                <p>Total Licenses</p>
              </div>
            </div>
            <div className="isl-stat-card">
              <div className="isl-stat-icon-wrap" style={{ background: "#ecfdf5", color: "#10b981" }}><CheckCircle size={20} /></div>
              <div className="isl-stat-info">
                <h4>{stats.available || licenses.filter(l => l.status === "Available").length}</h4>
                <p>Active Licenses</p>
              </div>
            </div>
            <div className="isl-stat-card">
              <div className="isl-stat-icon-wrap" style={{ background: "#fef2f2", color: "#ef4444" }}><AlertCircle size={20} /></div>
              <div className="isl-stat-info">
                <h4>{stats.expired || 0}</h4>
                <p>Critical / Expired</p>
              </div>
            </div>
            <div className="isl-stat-card">
              <div className="isl-stat-icon-wrap" style={{ background: "#fffbeb", color: "#f59e0b" }}><Clock size={20} /></div>
              <div className="isl-stat-info">
                <h4>{stats.expiringSoon || 0}</h4>
                <p>Upcoming Renewals</p>
              </div>
            </div>
            <div className="isl-stat-card">
              <div className="isl-stat-icon-wrap" style={{ background: "#eff6ff", color: "#3b82f6" }}><KeyRound size={20} /></div>
              <div className="isl-stat-info">
                <h4>{stats.assigned || 0}/{stats.total || licenses.length}</h4>
                <p>Licenses Used</p>
              </div>
            </div>
          </div>

          {/* Filter Row */}
          <div className="isl-filters-row">
            <div className="isl-search-box">
              <Search size={18} color="#94a3b8" />
              <input type="text" placeholder="Search license key or user..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="isl-select-wrap">
              <Filter size={16} className="isl-select-icon" />
              <select className="isl-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Status</option>
                <option value="Available">Available</option>
                <option value="Assigned">Assigned</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
            <div className="isl-result-count">{filteredLicenses.length} results</div>
          </div>

          {/* Table */}
          <div className="isl-table-card">
            <table className="isl-table">
              <thead>
                <tr>
                  <th>Software</th>
                  <th>License Key</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Device</th>
                  <th>Renewal</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" style={{ textAlign: "center", padding: "100px" }}><Loader2 size={40} className="isl-spinner" /></td></tr>
                ) : filteredLicenses.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: "center", padding: "100px" }}><p>No licenses found.</p></td></tr>
                ) : (
                  filteredLicenses.map((item) => {
                    const renewalStatus = getRenewalStatus(item.expiryDate);
                    return (
                      <tr key={item._id}>
                        <td>
                          <div className="isl-software-cell">
                            <div className="isl-software-icon">{initials}</div>
                            <div className="isl-software-info">
                              <strong>{softwareName}</strong>
                              <span>{vendor}</span>
                            </div>
                          </div>
                        </td>
                        <td><span className="isl-license-key">{item.licenseKey}</span></td>
                        <td><span className={`isl-badge ${getBadgeClass(item.status, "status")}`}>{item.status}</span></td>
                        <td>{getEmployeeName(item.assignedTo)}</td>
                        <td>{item.assignedDevice || <span style={{ color: "#cbd5e1" }}>—</span>}</td>
                        <td><span className={`isl-badge ${getBadgeClass(renewalStatus, "renewal")}`}>{renewalStatus}</span></td>
                        <td>
                          <div className="isl-actions">
                            <button className="isl-action-btn isl-action-btn--view"><Eye size={16} /></button>
                            <button className="isl-action-btn isl-action-btn--edit" onClick={() => handleOpenEdit(item)}><Edit size={16} /></button>
                            <button className="isl-action-btn isl-action-btn--delete" onClick={() => setDeleteConfirm(item)}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="isl-pagination">
            <button className="isl-page-btn" disabled><ChevronLeft size={16} /> Previous</button>
            <button className="isl-page-btn" disabled>Next <ChevronRight size={16} /></button>
          </div>
        </main>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="isl-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="isl-modal" onClick={e => e.stopPropagation()}>
            <div className="isl-modal-header">
              <div className="isl-modal-title">
                <div className="isl-modal-icon"><Plus size={20} /></div>
                <div>
                  <h2>{editItem ? "Edit License" : "Add License"}</h2>
                  <p>{editItem ? "Update existing license details" : "Register a new software key"}</p>
                </div>
              </div>
              <button className="isl-modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form className="isl-modal-form" onSubmit={handleSubmit}>
              <div className="isl-form-group">
                <label>License Key</label>
                <div className="isl-input-wrap">
                  <KeyRound size={18} />
                  <input
                    type="text"
                    placeholder="Enter license key..."
                    value={formData.licenseKey}
                    onChange={(e) => setFormData({ ...formData, licenseKey: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="isl-form-grid">
                <div className="isl-form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Available">Available</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
                <div className="isl-form-group">
                  <label>Expiry Date</label>
                  <div className="isl-input-wrap">
                    <Calendar size={18} />
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {formData.status === "Assigned" && (
                <div className="isl-form-grid">
                  <div className="isl-form-group">
                    <label>Employee</label>
                    <select
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    >
                      <option value="">Select Employee</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="isl-form-group">
                    <label>Device ID</label>
                    <div className="isl-input-wrap">
                      <Monitor size={18} />
                      <input
                        type="text"
                        placeholder="e.g. LAPTOP-001"
                        value={formData.assignedDevice}
                        onChange={(e) => setFormData({ ...formData, assignedDevice: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="isl-modal-footer">
                <button type="button" className="isl-btn isl-btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="isl-btn isl-btn-primary" disabled={submitting}>
                  {submitting ? <Loader2 size={16} className="isl-spinner" /> : (editItem ? "Update License" : "Add License")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="isl-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="isl-modal" style={{ maxWidth: "400px", textAlign: "center" }}>
            <div className="isl-delete-icon" style={{ margin: "0 auto 20px" }}><Trash2 size={32} /></div>
            <h2>Delete License?</h2>
            <p>Are you sure you want to remove this license key? This action is permanent.</p>
            <div className="isl-modal-footer" style={{ border: "none", justifyContent: "center" }}>
              <button className="isl-btn isl-btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="isl-btn" style={{ background: "#ef4444", color: "white" }} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}