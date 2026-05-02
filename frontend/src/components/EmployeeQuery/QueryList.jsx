import { useEffect, useState } from "react";
import { getMyQueries } from "../../pages/QueryPage/QueryAPI";
import "./QueryList.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STATUS_META = {
  Pending: { className: "status-badge pending", label: "Pending" },
  "In Progress": { className: "status-badge in-progress", label: "In Progress" },
  Resolved: { className: "status-badge resolved", label: "Resolved" },
  Rejected: { className: "status-badge rejected", label: "Rejected" },
};

const PRIORITY_META = {
  Low: { className: "priority-badge low" },
  Medium: { className: "priority-badge medium" },
  High: { className: "priority-badge high" },
  Critical: { className: "priority-badge critical" },
};

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.Pending;
  return (
    <span className={meta.className}>
      <span className="status-dot"></span>
      {meta.label}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const meta = PRIORITY_META[priority] || PRIORITY_META.Medium;
  return <span className={meta.className}>{priority}</span>;
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const QueryDetailModal = ({ query, onClose }) => {
  if (!query) return null;

  return (
    <div className="query-modal-overlay">
      <div className="query-modal-backdrop" onClick={onClose} />
      <div className="query-modal-panel">
        <div className="query-modal-header">
          <div>
            <div className="query-modal-badges">
              <StatusBadge status={query.status} />
              <PriorityBadge priority={query.priority} />
            </div>
            <h2 className="query-modal-title">{query.subject}</h2>
            <p className="query-modal-date">Submitted {formatDate(query.createdAt)}</p>
          </div>

          <button onClick={onClose} className="query-modal-close-btn">✕</button>
        </div>

        <div className="query-modal-body">
          <div className="query-meta-grid">
            <div className="query-meta-card">
              <p className="query-meta-label">Query Type</p>
              <p className="query-meta-value">{query.queryType}</p>
            </div>
            <div className="query-meta-card">
              <p className="query-meta-label">Status</p>
              <StatusBadge status={query.status} />
            </div>
          </div>

          <div>
            <p className="query-section-title">Description</p>
            <p className="query-description-box">{query.description}</p>
          </div>

          {query.responseMessage && (
            <div className="admin-response-box">
              <div className="admin-response-header">
                <span className="admin-response-title">IT Team Response</span>
              </div>
              <p className="admin-response-text">{query.responseMessage}</p>
            </div>
          )}

          {query.resolvedAt && (
            <p className="query-resolved-text">
              ✅ Resolved on {formatDate(query.resolvedAt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default function QueryList() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,setTotalPages]=useState(1);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getMyQueries(currentPage,5,filterStatus);
      console.log("THese re queries",res.queries)
      setQueries( res.queries||[]);
      setTotalPages(res.totalPages || 1);
      
    } catch (err) {
      setError(err.message || "Failed to load queries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [currentPage,filterStatus]);

   const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilter = (status) => {
    setFilterStatus(status);
      setCurrentPage(1);
  };

  if (loading) {
    return <div className="query-loading-list">Loading...</div>;
  }

  if (error) {
    return (
      <div className="query-error-state">
        <p className="query-error-text">{error}</p>
        <button onClick={fetchQueries} className="query-retry-btn">
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="query-filter-tabs">
        {["", "Pending", "In Progress", "Resolved", "Rejected"].map((s) => (
          <button
            key={s || "all"}
            onClick={() => handleFilter(s)}
            className={`query-filter-btn ${filterStatus === s ? "active" : ""}`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {queries.length === 0 ? (
        <div className="query-empty-state">
          <p className="query-empty-title">No queries found</p>
          <p className="query-empty-text">
            {filterStatus
              ? `No ${filterStatus.toLowerCase()} queries.`
              : "You haven't submitted any queries yet."}
          </p>
        </div>
      ) : (
        <div className="query-list-wrapper">
          {queries.map((q) => (
            <button
              key={q._id}
              onClick={() => setSelectedQuery(q)}
              className="query-list-card"
            >
              <div className="query-list-card-inner">
                <div className="query-list-left">
                  <div className="query-list-top-row">
                    <span className="query-type-chip">{q.queryType}</span>
                    <PriorityBadge priority={q.priority} />
                  </div>

                  <p className="query-subject">{q.subject}</p>

                  <p className="query-date-line">
                    {formatDate(q.createdAt)}
                    {q.responseMessage && (
                      <span className="query-admin-responded">• Admin responded</span>
                    )}
                  </p>
                </div>

                <div className="query-list-right">
                  <StatusBadge status={q.status} />
                  <span className="query-arrow-icon">›</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

       {queries.length > 0 && (
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

      <QueryDetailModal
        query={selectedQuery}
        onClose={() => setSelectedQuery(null)}
      />
    </>
  );
}