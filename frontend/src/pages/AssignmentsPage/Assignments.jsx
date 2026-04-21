import { useState, useMemo, useEffect } from "react";
import "./Assignments.css";
import {
  createAssignment,
  getAllAssignments,
  returnAssignmentById,
  getEmployees,
  getLaptopModels,
  getLaptopAssets,
  getSoftware,
} from "./AssignmentAPI";

import {
  Search,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  ClipboardList,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Laptop,
  Package,
  User,
  Calendar,
  RotateCcw,
  Download,
} from "lucide-react";

import Navbar from "../../components/navBar/NavBar";
import Sidebar from "../../components/sideBar/SideBar";



const INITIAL_ASSIGNMENTS = [];

const STATUSES = ["All", "Assigned", "Returned"];
const ASSET_TYPES = ["All", "Laptop", "Software"];
  const data=JSON.parse(localStorage.getItem("User"));

const EMPTY_FORM = {
  employeeId: "",
  assetType: "Laptop",
  laptopModelId: "",
  laptopAssetId: "",
  softwareId: "",
  assignedBy:  data?.role || "",
  status:"Assigned",
  assignDate: new Date().toISOString().split("T")[0],
};
const  INITIAL_STATS=[];

const Assignments = () => {

  const [software, setSoftware] = useState([]);
  const [laptopModels, setLaptopModels] = useState([]);
  const [laptopAssets, setLaptopAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [deleteConfirm,setDeleteConfirm]=useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,setTotalPages]=useState(1);
  const[stats,setStats]=useState(INITIAL_STATS);


console.log(data.firstName);

  const fetchAssignments = async () => {
    try {
      const data = await getAllAssignments(currentPage, 5,search,typeFilter,statusFilter);
      console.log("ALL Assignments",data);
      setAssignments(data.assignments);
      setTotalPages(data.totalPages);
      setStats(data.stats);
    } catch (error) {
      console.log(error);
    }
  };
  console.log("All Assignments",assignments);
  useEffect(()=>{
        fetchAssignments();
  },[currentPage,search,typeFilter,statusFilter]);
  

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data?.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchLaptopModels = async () => {
    try {
      const data = await getLaptopModels();
      setLaptopModels(data?.allLaptopModels || []);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchLaptopAssets = async () => {
    try {
      const data = await getLaptopAssets();
      setLaptopAssets(data?.allLaptopAssets || []);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSoftware = async () => {
    try {
      const data = await getSoftware();
      setSoftware(data?.allSoftware || []);
    } catch (error) {
      console.log(error);
    }
  };
  
  useEffect(() => {
    fetchEmployees();
    fetchLaptopModels();
    fetchLaptopAssets();
    fetchSoftware();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

 

 

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  


  const validate = (f) => {
    const e = {};

    if (!f.employeeId) e.employeeId = "Employee is required";
    if (!f.assignDate) e.assignDate = "Assignment date is required";

    if (f.assetType === "Laptop") {
      if (!f.laptopModelId) e.laptopModelId = "Laptop model is required";
      if (!f.laptopAssetId) e.laptopAssetId = "Individual laptop asset is required";
    }

    if (f.assetType === "Software") {
      if (!f.softwareId) e.softwareId = "Software is required";
    }

    return e;
  };

  const handleAddNew = () => {
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setShowModal(true);
  };

  const handleViewDetails = (item) => {
  console.log("clicked item:", item);
  setShowDetail(item);
};
console.log("Show all",showDetail);


const handleReturn = async(assignment) => {

const data=await returnAssignmentById(assignment._id);
setAssignments((prev)=>prev.map((assign)=>assign._id==assignment._id?data.returnAssignment:assign));
showToast("Asset Returned Successfully");



    
    
  };

  const handleCloseModal = () => {
    setShowModal(false);
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
      const data = await createAssignment(formData);
      setAssignments((prev) => [data.assignment, ...prev]);
      showToast("Assignment created successfully");
      handleCloseModal();
    } catch (error) {
      console.log(error);
      showToast(error?.message || "Failed to create assignment", "error");
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    if (name === "assetType") {
      setFormData((prev) => ({
        ...prev,

        assetType: value,
        laptopModelId: "",
        laptopAssetId: "",
        softwareId: "",
      }));
    } else if (name === "laptopModelId") {
      setFormData((prev) => ({
        ...prev,
        laptopModelId: value,
        laptopAssetId: "",
      }));
    } 
    else if(name ==="assignedBy"){
setFormData((prev) => ({
      ...prev,
      assignedBy: data.role
    }));
    }else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    setFormErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const getAssetTypeColor = (type) => {
    return type === "Laptop"
      ? { bg: "#e0e7ff", color: "#6366f1" }
      : { bg: "#fce7f3", color: "#ec4899" };
  };

  const filteredLaptopAssets = laptopAssets.filter((asset) => {
    const assetModelId =
      typeof asset.laptopModelId === "object"
        ? asset.laptopModelId?._id
        : asset.laptopModelId;

    const isSameModel = assetModelId === formData.laptopModelId;
    const isAvailable = asset.status === "Available" || !asset.status;

    return isSameModel && isAvailable;
  });

  const selectedSoftwareDetails = software.find(
    (item) => item._id === formData.softwareId
  );

  return (
    <>
      <Navbar />
      <Sidebar />

      <div className="assign-page">
        {toast && (
          <div className={`assign-toast assign-toast--${toast.type}`}>
            {toast.type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{toast.msg}</span>
          </div>
        )}

        <div className="assign-header">
          <div className="assign-header-left">
            <div className="assign-header-icon">
              <ClipboardList size={26} />
            </div>
            <div>
              <h1 className="assign-title">Asset Assignments</h1>
              <p className="assign-subtitle">
                Manage laptop and software assignments
              </p>
            </div>
          </div>

          <div className="assign-header-right">
            <button className="assign-btn assign-btn--outline">
              <Download size={16} /> Export
            </button>
            <button
              className="assign-btn assign-btn--primary"
              onClick={handleAddNew}
            >
              <Plus size={18} /> New Assignment
            </button>
          </div>
        </div>

        <div className="assign-stats">
          <div className="assign-stat-card">
            <div
              className="assign-stat-icon"
              style={{ background: "rgba(99,102,241,0.12)", color: "#6366F1" }}
            >
              <ClipboardList size={22} />
            </div>
            <div>
              <div className="assign-stat-value">{stats.totalAssignments}</div>
              <div className="assign-stat-label">Total Assignments</div>
            </div>
          </div>

          <div className="assign-stat-card">
            <div
              className="assign-stat-icon"
              style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}
            >
              <CheckCircle size={22} />
            </div>
            <div>
              <div className="assign-stat-value">{stats.assigned}</div>
              <div className="assign-stat-label">Assigned</div>
            </div>
          </div>

          <div className="assign-stat-card">
            <div
              className="assign-stat-icon"
              style={{ background: "rgba(136,146,164,0.12)", color: "#8892A4" }}
            >
              <RotateCcw size={22} />
            </div>
            <div>
              <div className="assign-stat-value">{stats.returned}</div>
              <div className="assign-stat-label">Returned</div>
            </div>
          </div>

          <div className="assign-stat-card">
            <div
              className="assign-stat-icon"
              style={{ background: "rgba(99,102,241,0.12)", color: "#6366f1" }}
            >
              <Laptop size={22} />
            </div>
            <div>
              <div className="assign-stat-value">{stats.laptops}</div>
              <div className="assign-stat-label">Laptops Assigned</div>
            </div>
          </div>

          <div className="assign-stat-card">
            <div
              className="assign-stat-icon"
              style={{ background: "rgba(236,72,153,0.12)", color: "#ec4899" }}
            >
              <Package size={22} />
            </div>
            <div>
              <div className="assign-stat-value">{stats.software}</div>
              <div className="assign-stat-label">Software Assigned</div>
            </div>
          </div>
        </div>

        <div className="assign-filters">
          <div className="assign-search-wrap">
            <Search size={17} className="assign-search-icon" />
            <input
              className="assign-search"
              placeholder="Search by employee or asset name..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {search && (
              <button
                className="assign-search-clear"
                onClick={() => handleSearch("")}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="assign-filter-group">
            <Filter size={15} className="assign-filter-icon" />
            <select
              className="assign-select"
              value={typeFilter}
              onChange={(e) =>
                handleFilterChange(setTypeFilter)(e.target.value)
              }
            >
              {ASSET_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="assign-filter-group">
            <select
              className="assign-select"
              value={statusFilter}
              onChange={(e) =>
                handleFilterChange(setStatusFilter)(e.target.value)
              }
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <span className="assign-result-count">
            {assignments.length} result{assignments.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="assign-table-wrap">
          <table className="assign-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Asset Type</th>
                <th>Asset Name</th>
                <th>Assigned Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Assigned By</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="assign-empty">
                    <ClipboardList size={48} strokeWidth={1.2} />
                    <p>No assignments found</p>
                    <span>Try adjusting your filters</span>
                  </td>
                </tr>
              ) : (
                assignments.map((assign) => {
                  const typeColor = getAssetTypeColor(assign.assetType);

                  return (
                    <tr
                      key={assign._id || assign.id}
                      className="assign-row"
                    >
                      <td>
                        <div className="assign-employee-cell">
                          <div className="assign-avatar">
                            {assign.employeeName?.charAt(0) || "E"}
                          </div>
                          <div className="assign-employee-name">
                            {assign.employeeName}
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className="assign-type-badge"
                          style={{
                            background: typeColor.bg,
                            color: typeColor.color,
                          }}
                        >
                          {assign.assetType === "Laptop" ? (
                            <Laptop size={13} />
                          ) : (
                            <Package size={13} />
                          )}
                          {assign.assetType}
                        </span>
                      </td>

                      <td>
                        <span className="assign-asset-name">
                          {assign.assetName}
                        </span>
                      </td>

                      <td>
                        <div className="assign-date">
                          <Calendar size={13} />
                          {assign.assignDate
                            ? new Date(assign.assignDate).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "—"}
                        </div>
                      </td>

                      <td>
                        {assign.returnDate ? (
                          <div className="assign-date">
                            <Calendar size={13} />
                            {new Date(assign.returnDate).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </div>
                        ) : (
                          <span className="assign-no-date">—</span>
                        )}
                      </td>

                      <td>
                        <span
                          className={`assign-status-badge assign-status-badge--${assign.status?.toLowerCase()}`}
                        >
                          {assign.status}
                        </span>
                      </td>

                      <td>
                        <div className="assign-assigned-by">
                          <User size={13} />
                          {assign.assignedBy} 
                        </div>
                      </td>

                      <td>
                        <div className="assign-actions">
                          <button
                            className="assign-action-btn assign-action-btn--view"
                            title="View details"
                            onClick={() => handleViewDetails(assign)}
                          >
                            <Eye size={15} />
                          </button>

                          {assign.status === "Assigned" && (
                            <button
                              className="assign-action-btn assign-action-btn--return"
                              title="Return asset"
                              onClick={() => handleReturn(assign)}
                            >
                              <RotateCcw size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {assignments.length>0 && (
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

        {showModal && (
          <div className="assign-modal-overlay" onClick={handleCloseModal}>
            <div className="assign-modal" onClick={(e) => e.stopPropagation()}>
              <div className="assign-modal-header">
                <div className="assign-modal-title-wrap">
                  <div className="assign-modal-icon">
                    <ClipboardList size={22} />
                  </div>
                  <div>
                    <h2 className="assign-modal-title">New Assignment</h2>
                    <p className="assign-modal-sub">
                      Assign a laptop or software to an employee
                    </p>
                  </div>
                </div>

                <button
                  className="assign-modal-close"
                  onClick={handleCloseModal}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="assign-modal-body">
                <form onSubmit={handleSubmit} noValidate>
                  <div className="assign-form-row">
                    <div className="assign-form-group assign-form-group--full">
                      {/* <input
                            type="text"
                            name="assignedBy"
                            value={formData.role}
                         hidden
                          /> */}
                      <label>
                        Employee <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <div className="assign-select-wrap">
                        <select
                          name="employeeId"
                          value={formData.employeeId}
                          onChange={handleFormChange}
                          className={
                            formErrors.employeeId
                              ? "assign-input assign-input--error"
                              : "assign-input"
                          }
                        >
                          <option value="">Select employee</option>
                          {employees.map((emp) => (
                            <option key={emp._id} value={emp._id}>
                              {emp.fullName} - {emp.department}
                            </option>
                          ))}
                        </select>
                      </div>
                      {formErrors.employeeId && (
                        <span className="assign-field-error">
                          {formErrors.employeeId}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="assign-form-row">
                    <div className="assign-form-group">
                      <label>Asset Type</label>
                      <div className="assign-radio-group">
                        <label
                          className={`assign-radio-option ${
                            formData.assetType === "Laptop"
                              ? "assign-radio-option--active"
                              : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="assetType"
                            value="Laptop"
                            checked={formData.assetType === "Laptop"}
                            onChange={handleFormChange}
                          />
                          <Laptop size={18} />
                          <span>Laptop</span>
                        </label>

                        <label
                          className={`assign-radio-option ${
                            formData.assetType === "Software"
                              ? "assign-radio-option--active"
                              : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="assetType"
                            value="Software"
                            checked={formData.assetType === "Software"}
                            onChange={handleFormChange}
                          />
                          <Package size={18} />
                          <span>Software</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {formData.assetType === "Laptop" && (
                    <>
                      <div className="assign-form-row">
                        <div className="assign-form-group assign-form-group--full">
                          <label>
                            Laptop Model{" "}
                            <span style={{ color: "#ef4444" }}>*</span>
                          </label>
                          <div className="assign-select-wrap">
                            <select
                              name="laptopModelId"
                              value={formData.laptopModelId}
                              onChange={handleFormChange}
                              className={
                                formErrors.laptopModelId
                                  ? "assign-input assign-input--error"
                                  : "assign-input"
                              }
                            >
                              <option value="">Select laptop model</option>
                              {laptopModels.map((item) => (
                                <option key={item._id} value={item._id}>
                                  {item.modelName}
                                </option>
                              ))}
                            </select>
                          </div>
                          {formErrors.laptopModelId && (
                            <span className="assign-field-error">
                              {formErrors.laptopModelId}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="assign-form-row">
                        <div className="assign-form-group assign-form-group--full">
                          <label>
                            Individual Laptop Asset{" "}
                            <span style={{ color: "#ef4444" }}>*</span>
                          </label>
                          <div className="assign-select-wrap">
                            <select
                              name="laptopAssetId"
                              value={formData.laptopAssetId}
                              onChange={handleFormChange}
                              className={
                                formErrors.laptopAssetId
                                  ? "assign-input assign-input--error"
                                  : "assign-input"
                              }
                              disabled={!formData.laptopModelId}
                            >
                              <option value="">
                                {formData.laptopModelId
                                  ? "Select individual laptop asset"
                                  : "First select laptop model"}
                              </option>
                              {filteredLaptopAssets.map((asset) => (
                                <option key={asset._id} value={asset._id}>
                                  {asset.serialNumber}
                                </option>
                              ))}
                            </select>
                          </div>
                          {formErrors.laptopAssetId && (
                            <span className="assign-field-error">
                              {formErrors.laptopAssetId}
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {formData.assetType === "Software" && (
                    <>
                      <div className="assign-form-row">
                        <div className="assign-form-group assign-form-group--full">
                          <label>
                            Software <span style={{ color: "#ef4444" }}>*</span>
                          </label>
                          <div className="assign-select-wrap">
                            <select
                              name="softwareId"
                              value={formData.softwareId}
                              onChange={handleFormChange}
                              className={
                                formErrors.softwareId
                                  ? "assign-input assign-input--error"
                                  : "assign-input"
                              }
                            >
                              <option value="">Select software</option>
                              {software.map((item) => (
                                <option key={item._id} value={item._id}>
                                  {item.softwareName}
                                </option>
                              ))}
                            </select>
                          </div>
                          {formErrors.softwareId && (
                            <span className="assign-field-error">
                              {formErrors.softwareId}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="assign-form-row">
                        <div className="assign-form-group assign-form-group--full">
                          <label>Software Details</label>
                          <input
                            type="text"
                            className="assign-input"
                            readOnly
                            value={
                              selectedSoftwareDetails
                                ? `${selectedSoftwareDetails.softwareName}${selectedSoftwareDetails.version ? ` - ${selectedSoftwareDetails.version}` : ""}`
                                : ""
                            }
                            placeholder="Selected software details will appear here"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="assign-form-row">
                    <div className="assign-form-group">
                      <label>
                        Assignment Date{" "}
                        <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        type="date"
                        name="assignDate"
                        value={formData.assignDate}
                        onChange={handleFormChange}
                        className={
                          formErrors.assignDate
                            ? "assign-input assign-input--error"
                            : "assign-input"
                        }
                      />
                      {formErrors.assignDate && (
                        <span className="assign-field-error">
                          {formErrors.assignDate}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="assign-modal-footer">
                    <button
                      type="button"
                      className="assign-btn assign-btn--ghost"
                      onClick={handleCloseModal}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="assign-btn assign-btn--primary"
                    >
                      <CheckCircle size={16} /> Create Assignment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showDetail && (
          <div
            className="assign-modal-overlay"
            onClick={() => setShowDetail(null)}
          >
            <div
              className="assign-modal assign-modal--detail"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="assign-modal-header">
                <div className="assign-modal-title-wrap">
                  <div className="assign-avatar assign-avatar--lg">
                    {showDetail.employeeName?.charAt(0) || "E"}
                  </div>
                  <div>
                    <h2 className="assign-modal-title">Assignment Details</h2>
                    <p className="assign-modal-sub">
                      {showDetail.employeeName} · {showDetail.assetName}
                    </p>
                  </div>
                </div>

                <button
                  className="assign-modal-close"
                  onClick={() => setShowDetail(null)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="assign-modal-body">
                <div className="assign-detail-grid">
                  <div className="assign-detail-card">
                    <span className="assign-detail-label">Employee</span>
                    <span className="assign-detail-value">
                      <User size={14} style={{ marginRight: 6 }} />
                      {showDetail.employeeName}
                    </span>
                  </div>

                  <div className="assign-detail-card">
                    <span className="assign-detail-label">Asset Type</span>
                    <span className="assign-detail-value">
                      {showDetail.assetType === "Laptop" ? (
                        <Laptop size={14} style={{ marginRight: 6 }} />
                      ) : (
                        <Package size={14} style={{ marginRight: 6 }} />
                      )}
                      {showDetail.assetType}
                    </span>
                  </div>

                  <div className="assign-detail-card">
                    <span className="assign-detail-label">Asset Name</span>
                    <span className="assign-detail-value">
                      {showDetail.assetName}
                    </span>
                  </div>

                  <div className="assign-detail-card">
                    <span className="assign-detail-label">Assigned Date</span>
                    <span className="assign-detail-value">
                      <Calendar size={14} style={{ marginRight: 6 }} />
                      {showDetail.assignDate
                        ? new Date(showDetail.assignDate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : "—"}
                    </span>
                  </div>

                  <div className="assign-detail-card">
                    <span className="assign-detail-label">Return Date</span>
                    <span className="assign-detail-value">
                      {showDetail.returnDate ? (
                        <>
                          <Calendar size={14} style={{ marginRight: 6 }} />
                          {new Date(showDetail.returnDate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </>
                      ) : (
                        "Not returned"
                      )}
                    </span>
                  </div>

                  <div className="assign-detail-card">
                    <span className="assign-detail-label">Status</span>
                    <span
                      className={`assign-status-badge assign-status-badge--${showDetail.status?.toLowerCase()}`}
                    >
                      {showDetail.status}
                    </span>
                  </div>

                  <div className="assign-detail-card">
                    <span className="assign-detail-label">Assigned By</span>
                    <span className="assign-detail-value">
                      <User size={14} style={{ marginRight: 6 }} />
                      {showDetail.assignedBy || "Admin"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="assign-modal-footer">
                <button
                  className="assign-btn assign-btn--ghost"
                  onClick={() => setShowDetail(null)}
                >
                  Close
                </button>

                {showDetail.status === "Assigned" && (
                  <button
                    className="assign-btn assign-btn--danger"
                    onClick={() => {
                      setShowDetail(null);
                      handleReturn(showDetail);
                    }}
                  >
                    <RotateCcw size={15} /> Return Asset
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      {deleteConfirm && (
  <div
    className="assign-modal-overlay"
    onClick={() => setDeleteConfirm(null)}
  >
    <div
      className="assign-modal assign-modal--confirm"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="assign-modal-header">
        <div className="assign-modal-title-wrap">
          <div className="assign-modal-icon">
            <AlertCircle size={22} />
          </div>
          <div>
            <h2 className="assign-modal-title">Delete Assignment</h2>
            <p className="assign-modal-sub">
              This action cannot be undone
            </p>
          </div>
        </div>

        <button
          className="assign-modal-close"
          onClick={() => setDeleteConfirm(null)}
        >
          <X size={20} />
        </button>
      </div>

      <div className="assign-modal-body">
        <p>
          Are you sure you want to delete assignment of{" "}
          <strong>{deleteConfirm.employeeName}</strong> for{" "}
          <strong>{deleteConfirm.assetName}</strong>?
        </p>
      </div>

      <div className="assign-modal-footer">
        <button
          className="assign-btn assign-btn--ghost"
          onClick={() => setDeleteConfirm(null)}
        >
          Cancel
        </button>

        <button
          className="assign-btn assign-btn--danger"
          onClick={() => handleDelete(deleteConfirm._id)}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    </>
  );
};

export default Assignments;