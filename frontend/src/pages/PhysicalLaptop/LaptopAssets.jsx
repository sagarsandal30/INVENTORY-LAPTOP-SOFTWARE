import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  LayoutDashboard,
  Laptop,
  Package,
  Users,
  ClipboardList,
  FileText,
  Bell,
  Mail,
  Globe,
  Settings,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Monitor,
  Calendar,
  ChevronDown,
  Download,
  RefreshCw,
  Filter,
  Wrench,
  User,
   ChevronLeft,
  ChevronRight,
  BrainCircuit,
  Zap,
} from "lucide-react";

import "./LaptopAssets.css";
import Navbar from "../../components/navBar/NavBar";
import Sidebar from "../../components/sideBar/SideBar";

import {
  createLaptopAsset,
  getLaptopAssets,
  getLaptopAssetById,
  deleteLaptopAssetById,
  updateLaptopAssetById,
  getLaptopModels,
  getEmployees,
} from "./LaptopAssetsAPI";
import { predictFailure } from "../../API/aiApi";


const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Laptop, label: "Laptops", id: "laptops" },
  { icon: Package, label: "Software", id: "software" },
  { icon: Users, label: "Employees", id: "employees" },
  { icon: ClipboardList, label: "Assignments", id: "assignments" },
  { icon: FileText, label: "Reports", id: "reports" },
  { icon: Bell, label: "Notifications", id: "notifications" },
];

const STATUSES = ["All", "Available", "Assigned", "Under Repair","Retired"];
const CONDITIONS = ["All", "Good", "Damaged", "Needs Repair"];

const EMPTY_FORM = {
  modelName: "",
  laptopModelId: "",
  serialNumber: "",
  
  status: "Avaliable",
  condition: "Good",
  assignedTo: null,
};

/* ════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════ */
export default function LaptopAssets() {
  const [assets, setAssets] = useState([]);
  const [modelName, setModelName] = useState("");
  const [laptopModels, setLaptopModels] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState("laptops");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [conditionFilter, setConditionFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [aiPredicting, setAiPredicting] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats,setStats]=useState([]);

  const { modelId } = useParams();
  console.log(modelId);


  /* ── Toast notification ── */
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Validation ── */
  const validate = (f) => {
    const e = {};
    if (!f.laptopModelId) e.laptopModelId = "Laptop model is required";
    if (!f.serialNumber.trim()) e.serialNumber = "Serial number is required";

    // If status is "Assigned", assignedTo is required
    if (f.status === "Assigned" && !f.assignedTo) {
      e.assignedTo = "Employee assignment is required when status is Assigned";
    }
    return e;
  };

  const fetchLaptopAssets = async () => {
    try {
      console.log("laptopassets")

      const data = await getLaptopAssets(currentPage, 5, modelId,search,statusFilter,conditionFilter);
      console.log(data)
      setAssets(data.existingLaptopAssets || []);
      setTotalPages(data.totalPages);
      setStats(data.stats || {});
    } catch (error) {
      console.error(error);
    }
  };
   useEffect(() => {
    fetchLaptopAssets();
  }, [currentPage, modelId,search,statusFilter,conditionFilter]);

  const fetchLaptopModels = async () => {
    try {
      const response = await getLaptopModels(1, 100); // Increased limit to see more models in dropdown
      setLaptopModels(response.existingLaptop || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchLaptopModels();
    fetchEmployees();
  }, []);


  /* ── Actions ── */
  const openAdd = () => {
    setEditItem(null);
    let defaultModelName = "";
    const selectedModel = laptopModels.find((m) => m._id === modelId);
    if (selectedModel) defaultModelName = selectedModel.modelName;
    console.log(defaultModelName);
    setFormData({
      ...EMPTY_FORM,
      laptopModelId: modelId,
      modelName: defaultModelName,
    });
    setFormErrors({});
    setShowModal(true);
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEdit = (item) => {
    setEditItem(item);
    setFormData({ ...item });
    setFormErrors({});
    setShowModal(true);
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
        const data = await updateLaptopAssetById(editItem._id, formData);
        console.log("Updated Asset", data);
        setAssets((prev) =>
          prev.map((asset) =>
            asset._id === editItem._id ? data.updateLaptop : asset,
          ),
        );
        showToast("Laptop asset updated successfully", "success");
        setShowModal(false);
      } else {
        const data = await createLaptopAsset(formData);
        setAssets((pre) => [data.newLaptop, ...pre]);
        showToast("Laptop asset added successfully", "success");
        setShowModal(false);
        setFormData(EMPTY_FORM);
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
  
const getModelName = (laptopModelId) => {
  if (!laptopModelId) 
    return "N/A";

  if (typeof laptopModelId === "object") {
    return laptopModelId.modelName || "N/A";
  }

  const model = laptopModels.find((m) => m._id === laptopModelId);
  return model ? model.modelName : "N/A";
};

 const handleShowDetail=async(details)=>{
    try{
      setShowDetail(details);
      const data=await getLaptopAssetById(showDetail._id);
  }catch(error){
      console.log(error);
  }
}

  const handleDelete = async (id) => {
    try {
      const data=await deleteLaptopAssetById(id);
      console.log("Deleted Asset", data);
      setAssets((prev)=>prev.filter((e)=>e._id!==id));
      setDeleteConfirm(null);
  }catch(error){
        console.log(error)
  };
  }

  const handlePredict = async (assetId) => {
    setAiPredicting(assetId);
    try {
      const res = await predictFailure(assetId);
      showToast(`Prediction Score: ${res.data.predictionScore}% - Risk: ${res.data.riskLevel}`, "success");
      fetchLaptopAssets(); // Refresh to get updated metrics
    } catch (error) {
      showToast(error.message || "AI Prediction failed", "error");
    } finally {
      setAiPredicting(null);
    }
  };
  const handleFormChange = (e) => {
    const { name, value } = e.target;

    // If status changes to non-Assigned, clear assignedTo
    if (name === "status" && value !== "Assigned") {
      setFormData((prev) => ({
        ...prev,
        status: value,
        assignedTo: null,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /* ── Get employee name ── */
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
      <div className="la-root">
        <div className="la-main">
          {/* ── Page Body ── */}
          <div className="la-body">
            {/* Page Header */}
            <div className="la-page-hdr">
              <div className="la-page-hdr-left">
                <div className="la-page-icon">
                  <Laptop size={22} />
                </div>
                <div>
                  <h1 className="la-page-title">Laptop Assets</h1>
                  <p className="la-page-sub">
                    Manage physical laptop inventory with serial numbers
                  </p>
                </div>
              </div>
              <div className="la-page-hdr-actions">
                <button className="la-btn la-btn--outline">
                  <Download size={15} /> Export
                </button>
                <button className="la-btn la-btn--primary" onClick={openAdd}>
                  <Plus size={16} /> Add Asset
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="la-stats-row">
              <div className="la-stat-card">
                <div
                  className="la-stat-icon"
                  style={{
                    background: "rgba(99,102,241,0.12)",
                    color: "#6366F1",
                  }}
                >
                  <Laptop size={20} />
                </div>
                <div>
                  <div className="la-stat-value">{stats.total}</div>
                  <div className="la-stat-label">Total Assets</div>
                </div>
              </div>
              <div className="la-stat-card">
                <div
                  className="la-stat-icon"
                  style={{
                    background: "rgba(16,185,129,0.12)",
                    color: "#10B981",
                  }}
                >
                  <CheckCircle size={20} />
                </div>
                <div>
                  <div className="la-stat-value">{stats.avaliable}</div>
                  <div className="la-stat-label">Avaliable</div>
                </div>
              </div>
              <div className="la-stat-card">
                <div
                  className="la-stat-icon"
                  style={{
                    background: "rgba(99,102,241,0.12)",
                    color: "#6366F1",
                  }}
                >
                  <Users size={20} />
                </div>
                <div>
                  <div className="la-stat-value">{stats.assigned}</div>
                  <div className="la-stat-label">Assigned</div>
                </div>
              </div>
              <div className="la-stat-card">
                <div
                  className="la-stat-icon"
                  style={{
                    background: "rgba(245,158,11,0.12)",
                    color: "#F59E0B",
                  }}
                >
                  <Wrench size={20} />
                </div>
                <div>
                  <div className="la-stat-value">{stats.repair}</div>
                  <div className="la-stat-label">Under Repair</div>
                </div>
              </div>
              <div className="la-stat-card">
                <div
                  className="la-stat-icon"
                  style={{
                    background: "rgba(107,114,128,0.12)",
                    color: "#6B7280",
                  }}
                >
                  <RefreshCw size={20} />
                </div>
                <div>
                  <div className="la-stat-value">{stats.retired || 0}</div>
                  <div className="la-stat-label">Retired</div>
                </div>
              </div>
              <div className="la-stat-card">
                <div
                  className="la-stat-icon"
                  style={{
                    background: "rgba(239,68,68,0.12)",
                    color: "#EF4444",
                  }}
                >
                  <AlertCircle size={20} />
                </div>
                <div>
                  <div className="la-stat-value">{stats.damaged}</div>
                  <div className="la-stat-label">Damaged</div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="la-filters">
              <div className="la-search-wrap">
                <Search size={16} className="la-search-icon" />
                <input
                  className="la-search"
                  placeholder="Search by serial number or model..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    className="la-search-clear"
                    onClick={() => setSearch("")}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="la-filter-group">
                <Filter size={14} className="la-filter-icon" />
                <select
                  className="la-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="la-select-arrow" />
              </div>

              <div className="la-filter-group">
                <select
                  className="la-select"
                  value={conditionFilter}
                  onChange={(e) => setConditionFilter(e.target.value)}
                >
                  {CONDITIONS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="la-select-arrow" />
              </div>

              <span className="la-result-count">
                {assets.length} result{assets.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Table */}
            <div className="la-table-wrap">
              <table className="la-table">
                <thead>
                  <tr>
                    <th>Serial Number</th>
                    <th>Model</th>
                    <th>Status</th>
                    <th>Condition</th>
                    <th>Assigned To</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="la-empty">
                        <Laptop size={40} strokeWidth={1.2} />
                        <p>No laptop assets found</p>
                        <span>
                          Try adjusting your filters or add a new asset
                        </span>
                      </td>
                    </tr>
                  ) : (
                    assets.map((a) => (
                      <tr key={a._id} className="la-row">
                        <td>
                          <span className="la-serial">{a.serialNumber}</span>
                        </td>
                        <td>
                          <div className="la-model-cell">
                            <Monitor size={16} />
                            <span>{(a.modelName)}</span>
                            {a.isNearEOL && (
                              <span className="la-eol-badge" title="Nearing 3-year end of life">
                                <Zap size={10} /> EOL
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span
                            className="la-status-badge"
                            style={{
                              background:
                                a.status === "Available" || a.status === "Available"
                                  ? "rgba(16,185,129,0.12)"
                                  : a.status === "Assigned"
                                    ? "rgba(99,102,241,0.12)"
                                    : a.status === "Retired"
                                      ? "rgba(107,114,128,0.12)"
                                      : "rgba(245,158,11,0.12)",
                              color:
                                a.status === "Available" || a.status === "Available"
                                  ? "#10B981"
                                  : a.status === "Assigned"
                                    ? "#6366F1"
                                    : a.status === "Retired"
                                      ? "#6B7280"
                                      : "#F59E0B",
                            }}
                          >
                            {(a.status === "Available" || a.status === "Avaliable") && (
                              <CheckCircle size={12} />
                            )}
                            {a.status === "Assigned" && <Users size={12} />}
                            {a.status === "Under Repair" && (
                              <Wrench size={12} />
                            )}
                            {a.status === "Retired" && (
                              <RefreshCw size={12} />
                            )}
                            {a.status}
                          </span>
                        </td>
                        <td>
                          <span
                            className="la-condition-badge"
                            style={{
                              background:
                                a.condition === "Good"
                                  ? "rgba(16,185,129,0.12)"
                                  : a.condition === "Damaged"
                                    ? "rgba(239,68,68,0.12)"
                                    : "rgba(245,158,11,0.12)",
                              color:
                                a.condition === "Good"
                                  ? "#10B981"
                                  : a.condition === "Damaged"
                                    ? "#EF4444"
                                    : "#F59E0B",
                            }}
                          >
                            {a.condition}
                          </span>
                        </td>
                        <td>
                          <div className="la-assigned-cell">
                            {a.assignedTo ? (
                              <>
                                <User size={14} />
                                <span>{getEmployeeName(a.assignedTo)}</span>
                              </>
                            ) : (
                              <span className="la-unassigned">—</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="la-actions">
                            <button
                              className="la-action-btn la-action-btn--view"
                              style={{ color: "#6366F1" }}
                              title="Predict Failure"
                              onClick={() => handlePredict(a._id)}
                              disabled={aiPredicting === a._id}
                            >
                              {aiPredicting === a._id ? (
                                <RefreshCw size={15} className="spin" />
                              ) : (
                                <BrainCircuit size={15} />
                              )}
                            </button>
                            <button
                              className="la-action-btn la-action-btn--view"
                              title="View"
                              onClick={() => handleShowDetail(a)}
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              className="la-action-btn la-action-btn--edit"
                              title="Edit"
                              onClick={() => openEdit(a)}
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              className="la-action-btn la-action-btn--delete"
                              title="Delete"
                              onClick={() => setDeleteConfirm(a)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        

        {assets.length>0 && (
          <div className="emp-pagination">
            <p className="emp-pagination-info">
             
            </p>
            <div className="emp-pagination-buttons">
          <button
                    className={`emp-btn-page emp-btn-page-nav `}
                    onClick={() => handlePageChange(currentPage-1)}
                    disabled={currentPage===1}
                 >
                    <ChevronLeft size={16} />
                Previous
                  </button>
                  <button
                                  className="emp-btn-page emp-btn-page-nav"
                                  onClick={() => handlePageChange(currentPage + 1)}
                                  disabled={currentPage === totalPages}
                                >
                                  Next
                                  <ChevronRight size={16} />
                                </button>
                                </div>
                                </div>
        )}
        </div>

        {/* ══════════════════════════════════════
          ADD/EDIT MODAL
      ══════════════════════════════════════ */}
        {showModal && (
          <div className="la-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="la-modal" onClick={(e) => e.stopPropagation()}>
              <div className="la-modal-hdr">
                <div className="la-modal-title-wrap">
                  <div className="la-modal-icon">
                    <Laptop size={20} />
                  </div>
                  <div>
                    <h2 className="la-modal-title">
                      {editItem ? "Edit Laptop Asset" : "Add New Laptop Asset"}
                    </h2>
                    <p className="la-modal-sub">
                      {editItem
                        ? "Update asset details"
                        : "Register a new physical laptop"}
                    </p>
                  </div>
                </div>
                <button
                  className="la-modal-close"
                  onClick={() => setShowModal(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="la-modal-body">
                <form onSubmit={handleSubmit} noValidate>
                  <div className="la-form-row">

                    <div className="la-form-group">
                       <label>Laptop Model *</label>
                      <select
                      name="laptopModelId"
                      value={formData.laptopModelId}
                      onChange={handleFormChange}
                      disabled={!!modelId || !!editItem}
                      className={formErrors.laptopModelId ? 'il-input il-input--error' : 'il-input'}
                    >
                      {laptopModels.map(m => (
                        <option key={m._id} value={m._id}>{m.modelName}</option>
                      ))}
                    </select>
                    {formErrors.laptopModelId && 
                    <span className="il-field-error">
                      {formErrors.laptopModelId}
                      </span>}
                      </div>
                    <div className="la-form-group">
                      <label>Serial Number *</label>
                      <input
                        name="serialNumber"
                        value={formData.serialNumber}
                        onChange={handleFormChange}
                        placeholder="e.g. DX15-2024-0891"
                        className={
                          formErrors.serialNumber
                            ? "la-input la-input--error"
                            : "la-input"
                        }
                        disabled={editItem} // Cannot change serial number when editing
                      />
                      {formErrors.serialNumber && (
                        <span className="la-field-error">
                          {formErrors.serialNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="la-form-row">
                    <div className="la-form-group">
                      <label>Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleFormChange}
                        className="la-input"
                      >
                        <option>Available</option>
                        <option>Assigned</option>
                        <option>Under Repair</option>
                        <option>Retired</option>
                      </select>
                    </div>
                    <div className="la-form-group">
                      <label>Condition</label>
                      <select
                        name="condition"
                        value={formData.condition}
                        onChange={handleFormChange}
                        className="la-input"
                      >
                        <option>Good</option>
                        <option>Damaged</option>
                        <option>Needs Repair</option>
                      </select>
                    </div>
                  </div>

                  {formData.status === "Assigned" && (
                    <div className="la-form-group la-form-group--full">
                      <label>Assign To Employee *</label>
                      <select
                        name="assignedTo"
                        value={formData.assignedTo || ""}
                        onChange={handleFormChange}
                        className={
                          formErrors.assignedTo
                            ? "la-input la-input--error"
                            : "la-input"
                        }
                      >
                        <option value="">Select Employee</option>
                        {employees.map((emp) => (
                          <option key={emp._id} value={emp._id}>
                            {emp.fullName}
                          </option>
                        ))}
                      </select>
                      {formErrors.assignedTo && (
                        <span className="la-field-error">
                          {formErrors.assignedTo}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="la-modal-footer">
                    <button
                      type="button"
                      className="la-btn la-btn--ghost"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="la-btn la-btn--primary">
                      {editItem ? (
                        <>
                          <RefreshCw size={15} /> Update
                        </>
                      ) : (
                        <>
                          <Plus size={15} /> Create
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
          DETAIL MODAL
      ══════════════════════════════════════ */}
        {showDetail && (
          <div className="la-modal-overlay" onClick={() => setShowDetail(null)}>
            <div
              className="la-modal la-modal--detail"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="la-modal-hdr">
                <div className="la-modal-title-wrap">
                  <div className="la-modal-icon">
                    <Monitor size={20} />
                  </div>
                  <div>
                    <h2 className="la-modal-title">
                      {showDetail.serialNumber}
                    </h2>
                    <p className="la-modal-sub">
                      {getModelName(showDetail.laptopModelId)}
                    </p>
                  </div>
                </div>
                <button
                  className="la-modal-close"
                  onClick={() => setShowDetail(null)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="la-modal-body">
                <div className="la-detail-grid">
                  <div className="la-detail-card">
                    <label className="la-detail-label">Model Name</label>
                    <span className="la-detail-value">
                      {getModelName(showDetail.laptopModelId)}
                    </span>
                  </div>
                  <div className="la-detail-card">
                    <span className="la-detail-label">Serial Number</span>
                    <span className="la-detail-value">
                      {showDetail.serialNumber}
                    </span>
                  </div>
                  <div className="la-detail-card">
                    <span className="la-detail-label">Status</span>
                    <span
                      className="la-status-badge"
                      style={{
                        background:
                          showDetail.status === "Avaliable"
                            ? "rgba(16,185,129,0.12)"
                            : "rgba(99,102,241,0.12)",
                        color:
                          showDetail.status === "Avaliable"
                            ? "#10B981"
                            : "#6366F1",
                      }}
                    >
                      {showDetail.status}
                    </span>
                  </div>
                  <div className="la-detail-card">
                    <span className="la-detail-label">Condition</span>
                    <span
                      className="la-condition-badge"
                      style={{
                        background:
                          showDetail.condition === "Good"
                            ? "rgba(16,185,129,0.12)"
                            : "rgba(239,68,68,0.12)",
                        color:
                          showDetail.condition === "Good"
                            ? "#10B981"
                            : "#EF4444",
                      }}
                    >
                      {showDetail.condition}
                    </span>
                  </div>
                  <div className="la-detail-card">
                    <span className="la-detail-label">Assigned To</span>
                    <span className="la-detail-value">
                      {getEmployeeName(showDetail.assignedTo)}
                    </span>
                  </div>
                  <div className="la-detail-card">
                    <span className="la-detail-label">Created Date</span>
                    <span className="la-detail-value">
                      {showDetail.createdAt
                        ? new Date(showDetail.createdAt).toLocaleDateString(
                            "en-GB",
                            { day: "2-digit", month: "long", year: "numeric" },
                          )
                        : "N/A"}
                    </span>
                  </div>
                  {showDetail.aiMetrics && (
                    <div className="la-detail-card la-detail-card--full" style={{ gridColumn: "span 2", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "15px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", color: "#6366F1" }}>
                        <BrainCircuit size={18} />
                        <span style={{ fontWeight: "700" }}>AI Failure Risk Analysis</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                        <div>
                          <label className="la-detail-label">Prediction Score</label>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ flex: 1, height: "8px", background: "#e2e8f0", borderRadius: "4px" }}>
                              <div style={{ height: "100%", width: `${showDetail.aiMetrics.predictionScore}%`, background: showDetail.aiMetrics.predictionScore > 70 ? "#ef4444" : "#f59e0b", borderRadius: "4px" }}></div>
                            </div>
                            <span className="la-detail-value">{showDetail.aiMetrics.predictionScore}%</span>
                          </div>
                        </div>
                        <div>
                          <label className="la-detail-label">Risk Level</label>
                          <span className={`la-status-badge ${showDetail.aiMetrics.riskLevel.toLowerCase()}`} style={{ 
                            background: showDetail.aiMetrics.riskLevel === "Critical" ? "#fef2f2" : "#fff7ed",
                            color: showDetail.aiMetrics.riskLevel === "Critical" ? "#dc2626" : "#ea580c"
                          }}>
                            {showDetail.aiMetrics.riskLevel}
                          </span>
                        </div>
                        <div style={{ gridColumn: "span 2" }}>
                          <label className="la-detail-label">AI Recommendation</label>
                          <p style={{ margin: "5px 0 0 0", fontSize: "13px", color: "#475569", fontStyle: "italic" }}>
                            "{showDetail.aiMetrics.aiRecommendation}"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="la-modal-footer">
                  <button
                    className="la-btn la-btn--ghost"
                    onClick={() => setShowDetail(null)}
                  >
                    Close
                  </button>
                  <button
                    className="la-btn la-btn--primary"
                    onClick={() => {
                      setShowDetail(null);
                      openEdit(showDetail);
                    }}
                  >
                    <Edit2 size={15} /> Edit Asset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
          DELETE CONFIRM
      ══════════════════════════════════════ */}
        {deleteConfirm && (
          <div
            className="la-modal-overlay"
            onClick={() => setDeleteConfirm(null)}
          >
            <div
              className="la-modal la-modal--confirm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="la-confirm-icon">
                <Trash2 size={28} color="#F43F5E" />
              </div>
              <h3 className="la-confirm-title">Delete Laptop Asset?</h3>
              <p className="la-confirm-text">
                Are you sure you want to remove laptop asset{" "}
                <strong>{deleteConfirm.serialNumber}</strong>? This action
                cannot be undone.
              </p>
              <div className="la-confirm-actions">
                <button
                  className="la-btn la-btn--ghost"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  className="la-btn la-btn--danger"
                  onClick={() => handleDelete(deleteConfirm._id)}
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
          TOAST NOTIFICATION
      ══════════════════════════════════════ */}
        {toast && (
          <div className={`la-toast la-toast--${toast.type}`}>
            <div className="la-toast-icon">
              {toast.type === "success" ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
            </div>
            <span className="la-toast-message">{toast.message}</span>
            <button className="la-toast-close" onClick={() => setToast(null)}>
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
  }

