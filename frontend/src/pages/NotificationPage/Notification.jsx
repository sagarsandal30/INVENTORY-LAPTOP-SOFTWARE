import React, { useState,useEffect } from "react";
import NavBar from "../../components/navBar/NavBar";
import SideBar from "../../components/sideBar/SideBar";
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
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  XCircle,
  X,
  CheckCheck,
  Trash2,
  Search,
  ChevronRight,
  BellOff,
  AlertCircle,
  RefreshCw,
  Key,
  Zap,
  Calendar,
  ChevronLeft,
} from "lucide-react";
import "./Notification.css";
 import {getAllNotifications,deleteNotification,markAllReadAPI,markReadAPI,deleteAllNotif} from "./NotificationAPI";
/* ─────────────────────────────────────────
   NAVIGATION
───────────────────────────────────────── */
// const NAV_ITEMS = [
//   { icon: LayoutDashboard, label: 'Dashboard',     id: 'dashboard'     },
//   { icon: Laptop,          label: 'Laptops',       id: 'laptops'       },
//   { icon: Package,         label: 'Software',      id: 'software'      },
//   { icon: Users,           label: 'Employees',     id: 'employees'     },
//   { icon: ClipboardList,   label: 'Assignments',   id: 'assignments'   },
//   { icon: FileText,        label: 'Reports',       id: 'reports'       },
//   { icon: Bell,            label: 'Notifications', id: 'notifications' },
// ];

/* ─────────────────────────────────────────
   NOTIFICATION DATA
───────────────────────────────────────── */
const INITIAL_NOTIFS = [
  // {
  //   id: 1,
  //   type: "critical",
  //   category: "Software",
  //   title: "License Expired — AutoCAD 2024",
  //   message:
  //     "AutoCAD 2024 license has expired for 15 seats in the Engineering department. Immediate renewal required to restore access for your team.",
  //   time: "2 min ago",
  //   read: false,
  //   action: "Renew Now",
  //   dept: "Engineering",
  // },
  // {
  //   id: 2,
  //   type: "critical",
  //   category: "Laptop",
  //   title: "MacBook Pro End-of-Life Alert",
  //   message:
  //     "14 MacBook Pro units assigned to the Finance team have reached their 3-year lifecycle end date. Schedule replacement laptops to maintain productivity.",
  //   time: "1 hr ago",
  //   read: false,
  //   action: "Schedule Replacement",
  //   dept: "Finance",
  // },
  // {
  //   id: 3,
  //   type: "warning",
  //   category: "Software",
  //   title: "Adobe Creative Suite Expiring in 28 Days",
  //   message:
  //     "Adobe Creative Suite license for 50 seats expires on 15 Mar 2025. Start the renewal process to avoid service interruption for the Design team.",
  //   time: "18 min ago",
  //   read: false,
  //   action: "View License",
  //   dept: "Design",
  // },
  // {
  //   id: 4,
  //   type: "warning",
  //   category: "Laptop",
  //   title: "Dell Latitude 5420 — Low Inventory",
  //   message:
  //     "Dell Latitude 5420 stock is critically low — only 3 units remaining against a minimum threshold of 10 units. Place a reorder immediately.",
  //   time: "3 hrs ago",
  //   read: false,
  //   action: "Reorder Now",
  //   dept: "IT Ops",
  // },
  // {
  //   id: 5,
  //   type: "info",
  //   category: "Assignment",
  //   title: "Dell XPS 15 Assigned to John Smith",
  //   message:
  //     "Dell XPS 15 (SN: DX15-2024-0891) successfully assigned to John Smith in Engineering. Asset status updated to In Use.",
  //   time: "2 hrs ago",
  //   read: false,
  //   action: "View Assignment",
  //   dept: "Engineering",
  // },
  // {
  //   id: 6,
  //   type: "success",
  //   category: "Software",
  //   title: "Microsoft Office 365 Renewed Successfully",
  //   message:
  //     "Microsoft Office 365 (300 seats, Enterprise Plan) has been successfully renewed. Next renewal date: Dec 31, 2026. No further action required.",
  //   time: "5 hrs ago",
  //   read: true,
  //   action: "View Details",
  //   dept: "All",
  // },
  // {
  //   id: 7,
  //   type: "warning",
  //   category: "Software",
  //   title: "GitHub Enterprise at 96% Capacity",
  //   message:
  //     "GitHub Enterprise is at 96% capacity (115/120 seats). Consider purchasing additional seats to avoid blocking new developer onboarding.",
  //   time: "1 day ago",
  //   read: true,
  //   action: "Add Seats",
  //   dept: "Engineering",
  // },
  // {
  //   id: 8,
  //   type: "info",
  //   category: "System",
  //   title: "Annual Growth Forecast Recalculated",
  //   message:
  //     "Projected laptop requirement for FY2026: 1,050 units (+5% YoY). Software license demand also increased across 3 productivity categories.",
  //   time: "1 day ago",
  //   read: true,
  //   action: "View Forecast",
  //   dept: "Management",
  // },
  // {
  //   id: 9,
  //   type: "success",
  //   category: "Laptop",
  //   title: "20 HP EliteBook 840 G11 Units Added",
  //   message:
  //     "20 new HP EliteBook 840 G11 units added to inventory. All units are available for immediate assignment to employees.",
  //   time: "2 days ago",
  //   read: true,
  //   action: "View Inventory",
  //   dept: "IT Ops",
  // },
  // {
  //   id: 10,
  //   type: "info",
  //   category: "Assignment",
  //   title: "MacBook Pro 16″ Returned by Mike Davis",
  //   message:
  //     'MacBook Pro 16" (SN: MBP-2021-0342) returned by Mike Davis. Asset status updated to Available for reassignment.',
  //   time: "2 days ago",
  //   read: true,
  //   action: "View Asset",
  //   dept: "Design",
  // },
  // {
  //   id: 11,
  //   type: "warning",
  //   category: "Software",
  //   title: "Tableau Desktop Renewal in 60 Days",
  //   message:
  //     "Tableau Desktop license (25 seats) for the Analytics team is due for renewal on Nov 10, 2025. Set a reminder or start renewal now.",
  //   time: "3 days ago",
  //   read: true,
  //   action: "Set Reminder",
  //   dept: "Analytics",
  // },
  // {
  //   id: 12,
  //   type: "info",
  //   category: "System",
  //   title: "New Employee Onboarded — Sarah Johnson",
  //   message:
  //     "Sarah Johnson has been added to the system under the Design department. Assets pending assignment: 1× Laptop + Adobe Creative Suite license.",
  //   time: "3 days ago",
  //   read: true,
  //   action: "Assign Assets",
  //   dept: "Design",
  // },
];

/* ─────────────────────────────────────────
   TYPE CONFIG
───────────────────────────────────────── */
const TYPE_CONFIG = {
  critical: {
    color: "#F43F5E",
    bg: "rgba(222, 61, 88, 0.1)",
    lightBg: "#FFF1F3",
    border: "#FECDD3",
    label: "Critical",
    Icon: AlertTriangle,
  },
  warning: {
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.10)",
    lightBg: "#FFFBEB",
    border: "#FDE68A",
    label: "Warning",
    Icon: Clock,
  },
  info: {
    color: "#6366F1",
    bg: "rgba(99,102,241,0.10)",
    lightBg: "#F5F3FF",
    border: "#C7D2FE",
    label: "Info",
    Icon: Info,
  },
  success: {
    color: "#10B981",
    bg: "rgba(16,185,129,0.10)",
    lightBg: "#ECFDF5",
    border: "#A7F3D0",
    label: "Success",
    Icon: CheckCircle,
  },
};



const CATEGORIES = ["All", "Software", "Laptop", "Assignment", "System","Query"];
const FILTERS = ["All", "Unread", "Critical", "Warning", "Info", "Success"];

/* ════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════ */
const Notification = () => {
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS);
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeCat, setActiveCat] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [currentPage,setCurrentPage]=useState(1);
  const [totalPages,setTotalPages]=useState(1);
  const [toast,setToast]=useState(null);
  const[unread,setUnRead]=useState([]);


// GET ALL NOTIFICATIONS
const fetchAllNotifications= async()=>{
  try {
    const response= await getAllNotifications(currentPage,10,search,activeCat,activeFilter);
    console.log(response);
    setNotifs(response.allNotifications);
    setUnRead(response.UnreadNotify);
    setTotalPages(response.totalPages);
  
}catch(error){
  console.error("Error fetching notifications:",error);
}
}
useEffect(()=>{
  const loadNotifications = async () => {
    await fetchAllNotifications();
  };

  loadNotifications();

},[currentPage,search,activeCat,activeFilter])

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  /* ── Derived ── */
  const unreadCount = notifs.filter((n) => !n.read).length;
  const criticalCount = notifs.filter(
    (n) => n.type?.toLowerCase() === "critical" && !n.read,
  ).length;

  /* ── Actions ── */
  //Function for Mark Single Read true
  const markRead = async(id) =>{
 const data= await markReadAPI(id);
setNotifs((prev) =>
      prev.map((n) => (n._id === id ? data.updated : n)),
    );
  }
  
//Function for Mark All Read
  const markAllRead = async() =>{
       await markAllReadAPI();
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  }
 

  const deleteNotif = async(id) => {
    await deleteNotification(id);
    setNotifs((prev) => prev.filter((n) => n._id !== id));
    if (selected?._id === id)
       setSelected(null);
  };

  const clearAll = async() => {
   await deleteAllNotif();
    setNotifs([]);
    setSelected(null);
    showToast("All Notifications Deleted");

  };

  const openDetail = (n) => {
    setSelected(n);
  
    if (n.read===false){
        markRead(n._id);
    }
    
  };


  /* ════════════════ RENDER ════════════════ */
  return (
    <div className="nf-root">
      <NavBar />
      <SideBar />
      <div className="nf-main">
        {/* ── Page body ── */}
        <div className="nf-body">
          {/* Page header */}
          <div className="nf-page-hdr">
            <div className="nf-page-hdr-left">
              <div className="nf-page-icon">
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="nf-page-icon-badge">{unreadCount}</span>
                )}
              </div>
              <div>
                <h1 className="nf-page-title">Notifications</h1>
                <p className="nf-page-sub">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                    : "All caught up!"}
                  {criticalCount > 0 && (
                    <span className="nf-critical-chip">
                      <AlertTriangle size={11} />
                      {criticalCount} critical
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="nf-page-hdr-actions">
              {unreadCount > 0 && (
                <button
                  className="nf-btn nf-btn--outline"
                  onClick={markAllRead}
                >
                  <CheckCheck size={15} />
                  Mark all read
                </button>
              )}
            
              {notifs.length > 0 && (
                <button className="nf-btn nf-btn--danger" onClick={clearAll}>
                  <Trash2 size={15} />
                  Clear All
                </button>
              )}
            </div>
          </div>

          
          {/* ── Summary Pills ── */}
          <div className="nf-summary-row">
            {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
              const count = notifs.filter((n) => n.type?.toLowerCase() === type).length;
              const active = activeFilter === cfg.label;
              return (
                <button
                  key={type}
                  className={`nf-pill ${active ? "nf-pill--active" : ""}`}
                  style={{ "--pc": cfg.color, "--pb": cfg.bg }}
                  onClick={() => setActiveFilter(active ? "All" : cfg.label)}
                >
                  <span
                    className="nf-pill-dot"
                    style={{ background: cfg.color }}
                  />
                  <span className="nf-pill-text">{cfg.label}</span>
                  <span
                    className="nf-pill-count"
                    style={{
                      background: cfg.bg,
                      color: cfg.color,
                      border: `1px solid ${cfg.color}`,
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Main layout: list + optional detail ── */}
          <div className={`nf-layout ${selected ? "nf-layout--split" : ""}`}>
            {/* ────── List Panel ────── */}
            <div className="nf-list-panel">
              {/* Controls */}
              <div className="nf-controls">
                {/* Search */}
                <div className="nf-search-wrap">
                  <Search size={16} className="nf-search-ico" />
                  <input
                    className="nf-search"
                    placeholder="Search notifications..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button
                      className="nf-search-clear"
                      onClick={() => setSearch("")}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Filter tabs */}
                <div className="nf-filter-tabs">
                  {FILTERS.map((f) => (
                    <button
                      key={f}
                      className={`nf-filter-tab ${activeFilter === f ? "nf-filter-tab--active" : ""}`}
                       onClick={() => setActiveFilter(f)}
                    >
                      {f}
                      {f === "Unread" && unreadCount > 0 && (
                        <span className="nf-tab-count">{unreadCount}</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Category buttons */}
                <div className="nf-cat-row">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      className={`nf-cat-btn ${activeCat === c ? "nf-cat-btn--active" : ""}`}
                      onClick={() => setActiveCat(c)}
                    >
                      {c}
                    </button>
                  ))}
                  <span className="nf-result-count">
                    {notifs.length} result{notifs.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Notification list */}
              <div className="nf-list">
                {notifs.length === 0 ? (
                  <div className="nf-empty">
                    <BellOff size={46} strokeWidth={1.2} />
                    <p>No notifications found </p>
                    <span>Try adjusting your search or filters</span>
                  </div>
                ) : (
                  notifs.map((n, idx) => {
                    const cfg = TYPE_CONFIG[n.type?.toLowerCase()]|| TYPE_CONFIG.info;
                    const NIcon = cfg.Icon;
                    return (
                      <div
                        key={n._id}
                        className={[
                          "nf-item",
                          !n.read ? "nf-item--unread" : "",
                          selected?._id === n._id ? "nf-item--selected" : "",
                        ].join(" ")}
                        style={{ animationDelay: `${idx * 0.04}s` }}
                        onClick={() => openDetail(n)}
                      >
                        {/* Unread indicator */}
                        {!n.read && (
                          <span
                            className="nf-unread-dot"
                            style={{ background: cfg.color }}
                          />
                        )}

                        {/* Icon */}
                        <div
                          className="nf-item-icon"
                          style={{ background: cfg.bg, color: cfg.color }}
                        >
                          <NIcon size={18} />
                        </div>

                        {/* Content */}
                        <div className="nf-item-content">
                          <div className="nf-item-top">
                            <span className="nf-item-title">{n.title}</span>
                            <span className="nf-item-time">{new Date(n.time).toLocaleString()}
</span>
                          </div>
                          <p className="nf-item-msg">{n.message}</p>
                          <div className="nf-item-meta">
                            <span
                              className="nf-badge-type"
                              style={{ background: cfg.bg, color: cfg.color }}
                            >
                              {cfg.label}
                            </span>
                            <span className="nf-badge-cat">{n.category}</span>
                            <span className="nf-badge-dept">{n.dept}</span>
                          </div>
                        </div>

                        {/* Arrow */}
                        <ChevronRight size={16} className="nf-item-arrow" />

                        {/* Delete */}
                        <button
                          className="nf-item-del"
                          title="Remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotif(n._id);
                          }}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

{/* pagination */}
{notifs.length > 0 && (
          <div className="emp-pagination">
            <p className="emp-pagination-info">
            </p>
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
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}


            {/* ────── Detail Panel ────── */}
            {selected &&
              (() => {
                const cfg = TYPE_CONFIG[selected.type?.toLowerCase()] || TYPE_CONFIG.info;
                const DIcon = cfg.Icon;
                return (
                  <div className="nf-detail-panel">
                    <div className="nf-detail-hdr">
                      <span className="nf-detail-hdr-label">
                        Notification Detail
                      </span>
                      <button
                        className="nf-detail-close"
                        onClick={() => setSelected(null)}
                      >
                        <X size={17} />
                      </button>
                    </div>

                    <div className="nf-detail-body">
                      {/* Big icon */}
                      <div
                        className="nf-detail-icon-ring"
                        style={{
                          background: cfg.lightBg,
                          border: `2px solid ${cfg.border}`,
                        }}
                      >
                        <div
                          className="nf-detail-icon-inner"
                          style={{ background: cfg.bg, color: cfg.color }}
                        >
                          <DIcon size={28} />
                        </div>
                      </div>

                      {/* Type chip */}
                      <span
                        className="nf-detail-chip"
                        style={{
                          background: cfg.bg,
                          color: cfg.color,
                          border: `1px solid ${cfg.border}`,
                        }}
                      >
                        {cfg.label}
                      </span>

                      <h2 className="nf-detail-title">{selected.title}</h2>
                      <p className="nf-detail-msg">{selected.message}</p>

                      {/* Meta grid */}
                      <div className="nf-detail-grid">
                        <div className="nf-detail-cell">
                          <span className="nf-meta-label">Category</span>
                          <span className="nf-meta-value">
                            {selected.category}
                          </span>
                        </div>
                        <div className="nf-detail-cell">
                          <span className="nf-meta-label">Department</span>
                          <span className="nf-meta-value">{selected.dept}</span>
                        </div>
                        <div className="nf-detail-cell">
                          <span className="nf-meta-label">Received</span>
               

                          <span className="nf-meta-value">{new Date(selected.time).toLocaleString()}</span>
                        </div>
                        <div className="nf-detail-cell">
                          <span className="nf-meta-label">Status</span>
                          <span className="nf-meta-value nf-meta-green">
                            <CheckCircle size={13} /> Read
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="nf-detail-actions">
                        <button className="nf-btn nf-btn--primary nf-btn--full">
                          {selected.action}
                          <ChevronRight size={15} />
                        </button>
                        <button
                          className="nf-btn nf-btn--danger nf-btn--full"
                          onClick={() => deleteNotif(selected._id)}
                        >
                          <Trash2 size={14} />
                          Remove Notification
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Notification;