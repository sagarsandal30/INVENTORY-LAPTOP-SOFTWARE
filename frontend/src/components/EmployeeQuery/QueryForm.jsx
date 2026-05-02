import { useState } from "react";
import { submitQuery } from "../../pages/QueryPage/QueryAPI";
import "./QueryForm.css";


export default function QueryForm({ onSuccess }) {
  const [form, setForm] = useState({
    queryType: "",
    subject: "",
    description: "",
    priority: "Medium",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validate = () => {
    if (!form.queryType) return "Please select a query type.";
    if (!form.subject.trim()) return "Subject is required.";
    if (!form.description.trim()) return "Description is required.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await submitQuery(form);
      console.log("Query submitted:", res.query);

      setSuccess(true);
      setForm({
        queryType: "",
        subject: "",
        description: "",
        priority: "Medium",
      });

      onSuccess?.();
    } catch (err) {
      setError(err.message || "Failed to submit query. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccess(false);
    setError("");
  };

  if (success) {
    return (
    
      <div className="query-success">
        <div className="success-icon-box">✔</div>
        <h3 className="success-title">Query Submitted!</h3>
        <p className="success-text">Your request has been received.</p>
        <button onClick={handleReset} className="primary-btn">
          Submit Another Query
        </button>
      </div>
    );
  }

  return (
    <>
   
    <form onSubmit={handleSubmit} className="query-form">
      {error && <div className="error-box">{error}</div>}

      <div className="form-group full">
        <label>Query Type *</label>
        <select
          name="queryType"
          value={form.queryType}
          onChange={handleChange}
          className="input"
        >
          <option value="">Select query</option>
          <option value="New Laptop Request">New Laptop Request</option>
          <option value="Laptop Replacement">Laptop Replacement</option>
          <option value="Laptop Issue / Repair">Laptop Issue / Repair</option>
          <option value="Software Installation Request">Software Installation Request</option>
          <option value="Software Access Request">Software Access Request</option>
          <option value="General IT Query">General IT Query</option>
        </select>
      </div>

      <div className="form-group full">
        <label>Subject *</label>
        <input
          type="text"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          className="input"
          placeholder="Enter subject"
        />
      </div>

      <div className="form-group full">
        <label>Priority *</label>
        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
          className="input"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
      </div>

      <div className="form-group full">
        <label>Description *</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="textarea"
          placeholder="Describe your issue"
        />
      </div>

      <div className="form-footer">
        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? "Submitting..." : "Submit Query"}
        </button>
      </div>
    </form>
    </>
  );
}