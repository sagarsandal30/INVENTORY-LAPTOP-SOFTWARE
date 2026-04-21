import { useState, useEffect } from "react";
import "./Software.css";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Package,
  Key,
  Calendar,
  RefreshCw,
  ChevronDown,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Navbar from "../../components/navBar/NavBar";
import SideBar from "../../components/sideBar/SideBar";
import {
  createSoftware,
  getSoftware,
  deleteSoftwareById,
  updateSoftwareById,
} from "./SoftwareAPI";

const INITIAL_SOFTWARE = [];

const CATEGORIES = [
  "All",
  "Productivity",
  "Design",
  "Communication",
  "Development",
  "Engineering",
  "Project Management",
  "Analytics",
];

const LIC_TYPES = ["Subscription", "Per Seat", "Perpetual", "Open Source"];

const VENDORS = [
  "Microsoft",
  "Adobe",
  "Salesforce",
  "GitHub Inc.",
  "Zoom",
  "Autodesk",
  "Atlassian",
  "Oracle",
  "Other",
];

const EMPTY_FORM = {
  softwareName: "",
  category: "Productivity",
  licenseType: "Subscription",
  vendor: "",
  totalLicenses: "",
  expiryDate: "",
  costPerMonth: "",
  version: "",
  notes: "",
};

const initial_stats = {
  totalSoftwares: 0,
  activeLicenses: 0,
  totalLicenses: 0,
  usedLicenses: 0,
  critical: 0,
  upcoming: 0,
};

const Software = () => {
  const [software, setSoftware] = useState(INITIAL_SOFTWARE);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPages] = useState(1);
  const [stats, setStats] = useState(initial_stats);

  const fetchSoftware = async () => {
    try {
      const data = await getSoftware(currentPage, 5, search, catFilter);
      console.log("Fetched All Software", data);

      setSoftware(data?.existingSoftware || []);
      setStats(data?.stats || initial_stats);
      setTotalPages(data?.totalPages || 1);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSoftware();
  }, [currentPage, search, catFilter]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value) => {
    setCatFilter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validate = (f) => {
    const e = {};

    if (!f.softwareName.trim()) e.softwareName = "Software name is required";
    if (!f.vendor.trim()) e.vendor = "Vendor is required";
    if (!f.totalLicenses || Number(f.totalLicenses) < 1) {
      e.totalLicenses = "Must be at least 1";
    }
    if (!f.expiryDate) e.expiryDate = "Expiry date is required";
    if (f.costPerMonth === "" || Number(f.costPerMonth) < 0) {
      e.cost = "Enter a valid cost";
    }

    return e;
  };

  const handleAddNew = () => {
    setEditItem(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setFormData({
      softwareName: item.softwareName || "",
      category: item.category || "Productivity",
      licenseType: item.licenseType || "Subscription",
      vendor: item.vendor || "",
      totalLicenses: item.totalLicenses || "",
      expiryDate: item.expiryDate
        ? new Date(item.expiryDate).toISOString().split("T")[0]
        : "",
      costPerMonth: item.costPerMonth || "",
      version: item.version || "",
      notes: item.notes || "",
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleViewDetails = (item) => {
    setShowDetail(item);
  };

  const handleDeleteConfirm = (item) => {
    setDeleteConfirm(item);
  };

  const handleDelete = async (id) => {
    try {
      const data = await deleteSoftwareById(id);
      console.log("DELETED", data);

      setSoftware((prev) => prev.filter((e) => e._id !== id));
      setDeleteConfirm(null);
      showToast("Software deleted successfully");
    } catch (error) {
      console.log(error);

      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "Something went wrong";

      showToast(errorMessage, "error");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditItem(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate(formData);
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }

    try {
      if (editItem) {
        const data = await updateSoftwareById(editItem._id, formData);
        console.log("SOFTWARE UPDATED", data);

        setSoftware((prev) =>
          prev.map((m) =>
            m._id === editItem._id ? data.updateSoftware : m
          )
        );

        showToast("Software updated successfully");
        handleCloseModal();
      } else {
        const data = await createSoftware(formData);
        console.log("SOFTWARE CREATED", data);

        setSoftware((prev) => [data.newSoftware, ...prev]);
        showToast(`"${data.newSoftware.softwareName}" added successfully`);
        handleCloseModal();
      }
    } catch (error) {
      console.log(error);

      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "Something went wrong";

      showToast(errorMessage, "error");
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  return (
    <>
      <Navbar />
      <SideBar />

      <div className="sw-page">
        {toast && (
          <div className={`sw-toast sw-toast--${toast.type}`}>
            {toast.type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{toast.msg}</span>
          </div>
        )}

        <div className="sw-header">
          <div className="sw-header-left">
            <div className="sw-header-icon">
              <Package size={26} />
            </div>
            <div>
              <h1 className="sw-title">Software Licenses</h1>
              <p className="sw-subtitle">
                Manage software inventory, licenses &amp; renewals
              </p>
            </div>
          </div>

          <div className="sw-header-right">
            <button className="sw-btn sw-btn--outline">
              <Download size={16} /> Export
            </button>
            <button className="sw-btn sw-btn--primary" onClick={handleAddNew}>
              <Plus size={18} /> Add Software
            </button>
          </div>
        </div>

        <div className="sw-stats">
          <div className="sw-stat-card">
            <div
              className="sw-stat-icon"
              style={{ background: "rgba(99,102,241,0.12)", color: "#6366F1" }}
            >
              <Package size={22} />
            </div>
            <div>
              <div className="sw-stat-value">{stats.totalSoftwares}</div>
              <div className="sw-stat-label">Total Software</div>
            </div>
          </div>

          <div className="sw-stat-card">
            <div
              className="sw-stat-icon"
              style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}
            >
              <CheckCircle size={22} />
            </div>
            <div>
              <div className="sw-stat-value">{stats.activeLicenses}</div>
              <div className="sw-stat-label">Active Licenses</div>
            </div>
          </div>

          <div className="sw-stat-card">
            <div
              className="sw-stat-icon"
              style={{ background: "rgba(244,63,94,0.12)", color: "#F43F5E" }}
            >
              <AlertTriangle size={22} />
            </div>
            <div>
              <div className="sw-stat-value">{stats.critical}</div>
              <div className="sw-stat-label">Critical / Expired</div>
            </div>
          </div>

          <div className="sw-stat-card">
            <div
              className="sw-stat-icon"
              style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B" }}
            >
              <Clock size={22} />
            </div>
            <div>
              <div className="sw-stat-value">{stats.upcoming}</div>
              <div className="sw-stat-label">Upcoming Renewals</div>
            </div>
          </div>

          <div className="sw-stat-card">
            <div
              className="sw-stat-icon"
              style={{ background: "rgba(99,102,241,0.12)", color: "#818CF8" }}
            >
              <Key size={22} />
            </div>
            <div>
              <div className="sw-stat-value">
                {stats.usedLicenses}
                <span>/{stats.totalLicenses}</span>
              </div>
              <div className="sw-stat-label">Licenses Used</div>
            </div>
          </div>
        </div>

        <div className="sw-filters">
          <div className="sw-search-wrap">
            <Search size={17} className="sw-search-icon" />
            <input
              className="sw-search"
              placeholder="Search software or vendor..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {search && (
              <button
                className="sw-search-clear"
                onClick={() => handleSearch("")}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="sw-filter-group">
            <Filter size={15} className="sw-filter-icon" />
            <select
              className="sw-select"
              value={catFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <ChevronDown size={14} className="sw-select-arrow" />
          </div>

          <span className="sw-result-count">
            {software.length} result{software.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="sw-table-wrap">
          <table className="sw-table">
            <thead>
              <tr>
                <th>Software</th>
                <th>Category</th>
                <th>License Type</th>
                <th>Licenses</th>
                <th>Usage</th>
                <th>Expiry</th>
                <th>Cost/mo</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {software.length === 0 ? (
                <tr>
                  <td colSpan="8" className="sw-empty">
                    <Package size={48} strokeWidth={1.2} />
                    <p>No software found</p>
                    <span>Try adjusting your filters</span>
                  </td>
                </tr>
              ) : (
                software.map((item) => {
                  const usedLicenses = Number(item.usedLicenses || 0);
                  const totalLicenses = Number(item.totalLicenses || 0);

                  const pct =
                    totalLicenses > 0
                      ? Math.round((usedLicenses / totalLicenses) * 100)
                      : 0;

                  const days = Math.ceil(
                    (new Date(item.expiryDate) - new Date()) /
                      (1000 * 60 * 60 * 24)
                  );

                  return (
                    <tr key={item._id} className="sw-row">
                      <td>
                        <div className="sw-name-cell">
                          <div className="sw-name-avatar">
                            {item.softwareName?.charAt(0) || "S"}
                          </div>
                          <div>
                            <div className="sw-name">{item.softwareName}</div>
                            <div className="sw-vendor">
                              {item.vendor} {item.version ? `· v${item.version}` : ""}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="sw-category-badge">
                          {item.category}
                        </span>
                      </td>

                      <td>
                        <div className="sw-lic-type">
                          <Key size={13} />
                          <span>{item.licenseType}</span>
                        </div>
                      </td>

                      <td>
                        <div className="sw-lic-count">
                          <span className="sw-lic-total">
                            {item.totalLicenses}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="sw-usage-wrap">
                          <div className="sw-usage-bar-bg">
                            <div
                              className="sw-usage-bar-fill"
                              style={{
                                width: `${pct}%`,
                                background:
                                  pct >= 95
                                    ? "#F43F5E"
                                    : pct >= 80
                                    ? "#F59E0B"
                                    : "#6366F1",
                              }}
                            />
                          </div>
                          <span
                            className="sw-usage-pct"
                            style={{
                              color:
                                pct >= 95
                                  ? "#F43F5E"
                                  : pct >= 80
                                  ? "#F59E0B"
                                  : "#6366F1",
                            }}
                          >
                            {pct}%
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="sw-expiry">
                          <Calendar size={13} />
                          <span>
                            {new Date(item.expiryDate).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>

                        {days <= 90 && days > 0 && (
                          <div
                            className="sw-days-left"
                            style={{
                              color: days <= 30 ? "#F43F5E" : "#F59E0B",
                            }}
                          >
                            {days}d left
                          </div>
                        )}

                        {days <= 0 && (
                          <div
                            className="sw-days-left"
                            style={{ color: "#8892A4" }}
                          >
                            Expired
                          </div>
                        )}
                      </td>

                      <td>
                        <span className="sw-cost">
                          ${Number(item.costPerMonth || 0).toFixed(2)}
                        </span>
                      </td>

                      <td>
                        <div className="sw-actions">
                          <button
                            className="sw-action-btn sw-action-btn--view"
                            title="View details"
                            onClick={() => handleViewDetails(item)}
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            className="sw-action-btn sw-action-btn--edit"
                            title="Edit"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit2 size={15} />
                          </button>

                          <button
                            className="sw-action-btn sw-action-btn--delete"
                            title="Delete"
                            onClick={() => handleDeleteConfirm(item)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {software.length > 0 && (
          <div className="emp-pagination">
            <p className="emp-pagination-info"></p>

            <div className="emp-pagination-buttons">
              <button
                className="emp-btn-page emp-btn-page-nav"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <button
                className="emp-btn-page emp-btn-page-nav"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPage}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {showModal && (
          <div className="sw-modal-overlay" onClick={handleCloseModal}>
            <div className="sw-modal" onClick={(e) => e.stopPropagation()}>
              <div className="sw-modal-header">
                <div className="sw-modal-title-wrap">
                  <div className="sw-modal-icon">
                    <Package size={22} />
                  </div>
                  <div>
                    <h2 className="sw-modal-title">
                      {editItem ? "Edit Software" : "Add New Software"}
                    </h2>
                    <p className="sw-modal-sub">
                      {editItem
                        ? "Update license details"
                        : "Register a new software license"}
                    </p>
                  </div>
                </div>

                <button className="sw-modal-close" onClick={handleCloseModal}>
                  <X size={20} />
                </button>
              </div>

              <div className="sw-modal-body">
                <form onSubmit={handleSubmit} noValidate>
                  <div className="sw-form-row">
                    <div className="sw-form-group sw-form-group--full">
                      <label>
                        Software Name <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        name="softwareName"
                        value={formData.softwareName}
                        onChange={handleFormChange}
                        placeholder="e.g. Microsoft Office 365"
                        className={
                          formErrors.softwareName
                            ? "sw-input sw-input--error"
                            : "sw-input"
                        }
                      />
                      {formErrors.softwareName && (
                        <span className="sw-field-error">
                          {formErrors.softwareName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="sw-form-row">
                    <div className="sw-form-group">
                      <label>
                        Vendor <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <div className="sw-select-wrap">
                        <select
                          name="vendor"
                          value={formData.vendor}
                          onChange={handleFormChange}
                          className={
                            formErrors.vendor
                              ? "sw-input sw-input--error"
                              : "sw-input"
                          }
                        >
                          <option value="">Select vendor</option>
                          {VENDORS.map((v) => (
                            <option key={v}>{v}</option>
                          ))}
                        </select>
                      </div>
                      {formErrors.vendor && (
                        <span className="sw-field-error">
                          {formErrors.vendor}
                        </span>
                      )}
                    </div>

                    <div className="sw-form-group">
                      <label>Version</label>
                      <input
                        name="version"
                        value={formData.version}
                        onChange={handleFormChange}
                        placeholder="e.g. 2024.1"
                        className="sw-input"
                      />
                    </div>
                  </div>

                  <div className="sw-form-row">
                    <div className="sw-form-group">
                      <label>Category</label>
                      <div className="sw-select-wrap">
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleFormChange}
                          className="sw-input"
                        >
                          {CATEGORIES.filter((c) => c !== "All").map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="sw-form-group">
                      <label>License Type</label>
                      <div className="sw-select-wrap">
                        <select
                          name="licenseType"
                          value={formData.licenseType}
                          onChange={handleFormChange}
                          className="sw-input"
                        >
                          {LIC_TYPES.map((l) => (
                            <option key={l}>{l}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="sw-form-row">
                    <div className="sw-form-group">
                      <label>
                        Total Licenses <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        type="number"
                        name="totalLicenses"
                        value={formData.totalLicenses}
                        onChange={handleFormChange}
                        placeholder="e.g. 100"
                        min="1"
                        className={
                          formErrors.totalLicenses
                            ? "sw-input sw-input--error"
                            : "sw-input"
                        }
                      />
                      {formErrors.totalLicenses && (
                        <span className="sw-field-error">
                          {formErrors.totalLicenses}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="sw-form-row">
                    <div className="sw-form-group">
                      <label>
                        Expiry Date <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        type="date"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleFormChange}
                        className={
                          formErrors.expiryDate
                            ? "sw-input sw-input--error"
                            : "sw-input"
                        }
                      />
                      {formErrors.expiryDate && (
                        <span className="sw-field-error">
                          {formErrors.expiryDate}
                        </span>
                      )}
                    </div>

                    <div className="sw-form-group">
                      <label>
                        Cost / Month ($) <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        type="number"
                        name="costPerMonth"
                        value={formData.costPerMonth}
                        step="0.01"
                        onChange={handleFormChange}
                        placeholder="e.g. 12.50"
                        min="0"
                        className={
                          formErrors.cost
                            ? "sw-input sw-input--error"
                            : "sw-input"
                        }
                      />
                      {formErrors.cost && (
                        <span className="sw-field-error">
                          {formErrors.cost}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="sw-form-group sw-form-group--full">
                    <label>Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleFormChange}
                      placeholder="Additional notes about this license..."
                      className="sw-textarea"
                      rows={3}
                    />
                  </div>

                  <div className="sw-modal-footer">
                    <button
                      type="button"
                      className="sw-btn sw-btn--ghost"
                      onClick={handleCloseModal}
                    >
                      Cancel
                    </button>

                    <button type="submit" className="sw-btn sw-btn--primary">
                      {editItem ? (
                        <>
                          <RefreshCw size={16} /> Update
                        </>
                      ) : (
                        <>
                          <Plus size={16} /> Add Software
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showDetail && (
          <div className="sw-modal-overlay" onClick={() => setShowDetail(null)}>
            <div
              className="sw-modal sw-modal--detail"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sw-modal-header">
                <div className="sw-modal-title-wrap">
                  <div className="sw-name-avatar sw-name-avatar--lg">
                    {showDetail.softwareName?.charAt(0) || "S"}
                  </div>
                  <div>
                    <h2 className="sw-modal-title">{showDetail.softwareName}</h2>
                    <p className="sw-modal-sub">
                      {showDetail.vendor} · Version {showDetail.version || "N/A"}
                    </p>
                  </div>
                </div>

                <button
                  className="sw-modal-close"
                  onClick={() => setShowDetail(null)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="sw-modal-body">
                <div className="sw-detail-grid">
                  <div className="sw-detail-card">
                    <span className="sw-detail-label">Category</span>
                    <span className="sw-detail-value">
                      {showDetail.category}
                    </span>
                  </div>

                  <div className="sw-detail-card">
                    <span className="sw-detail-label">License Type</span>
                    <span className="sw-detail-value">
                      {showDetail.licenseType}
                    </span>
                  </div>

                  <div className="sw-detail-card">
                    <span className="sw-detail-label">Total Licenses</span>
                    <span className="sw-detail-value">
                      {showDetail.totalLicenses}
                    </span>
                  </div>

                  <div className="sw-detail-card">
                    <span className="sw-detail-label">Expiry Date</span>
                    <span className="sw-detail-value">
                      {new Date(showDetail.expiryDate).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>

                  <div className="sw-detail-card">
                    <span className="sw-detail-label">Monthly Cost</span>
                    <span className="sw-detail-value">
                      ${Number(showDetail.costPerMonth || 0).toFixed(2)} / license
                    </span>
                  </div>

                  <div className="sw-detail-card">
                    <span className="sw-detail-label">Total Monthly Cost</span>
                    <span
                      className="sw-detail-value"
                      style={{ color: "#6366F1", fontWeight: 700 }}
                    >
                      $
                      {(
                        Number(showDetail.costPerMonth || 0) *
                        Number(showDetail.totalLicenses || 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>

                {showDetail.notes && (
                  <div className="sw-detail-section">
                    <span className="sw-detail-label">Notes</span>
                    <p className="sw-detail-notes">{showDetail.notes}</p>
                  </div>
                )}

                <div className="sw-modal-footer">
                  <button
                    className="sw-btn sw-btn--ghost"
                    onClick={() => setShowDetail(null)}
                  >
                    Close
                  </button>

                  <button
                    className="sw-btn sw-btn--primary"
                    onClick={() => {
                      setShowDetail(null);
                      handleEdit(showDetail);
                    }}
                  >
                    <Edit2 size={15} /> Edit License
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div
            className="sw-modal-overlay"
            onClick={() => setDeleteConfirm(null)}
          >
            <div
              className="sw-modal sw-modal--confirm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sw-confirm-icon">
                <Trash2 size={28} color="#F43F5E" />
              </div>

              <h3 className="sw-confirm-title">Delete Software?</h3>

              <p className="sw-confirm-text">
                Are you sure you want to remove{" "}
                <strong>"{deleteConfirm.softwareName}"</strong>? This action cannot
                be undone.
              </p>

              <div className="sw-confirm-actions">
                <button
                  className="sw-btn sw-btn--ghost"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </button>

                <button
                  className="sw-btn sw-btn--danger"
                  onClick={() => handleDelete(deleteConfirm._id)}
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Software;