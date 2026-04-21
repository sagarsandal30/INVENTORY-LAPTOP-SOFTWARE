const Query = require("../models/Query");
const {
  sendQueryNotificationEmail,
  sendQueryConfirmationEmail,
} = require("./EmailService");

// ---------------------------------------------------------------------------
// Create a new query (employee only)
// ---------------------------------------------------------------------------
const createQuery = async (data,params) => {

const{queryType,subject,description,priority}=data;
 const { id, username, email } =params; // from JWT — never trust client input for these fields
  // Validation
  
  if (!queryType || !subject || !description || !priority) {
    const err = new Error("queryType, subject, description, and priority are required.");
    err.statusCode = 400;
    throw err;
  }

  const query = await Query.create({
    employeeId:    id,        // from JWT — never from body
    employeeName:  username,
    employeeEmail: email,
    queryType,
    subject:       subject.trim(),
    description:   description.trim(),
    priority,
    status:        "Pending",
  });

  // Fire-and-forget email notifications (don't await to keep response fast)
  sendQueryNotificationEmail(query).catch(() => {});
  sendQueryConfirmationEmail(query).catch(() => {});
  
  return query;
};

// ---------------------------------------------------------------------------
// Get all queries for the logged-in employee (paginated)
// ---------------------------------------------------------------------------
const getMyQueries = async (  page , limit,  status ) => {
  const filter = {};

  if (status && status!=="All" ){
 filter.status  = status;
  }   
 

  const skip  = (page - 1) * limit;
  const total = await Query.countDocuments();

  const queries = await Query.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    queries,
    totalPages: Math.ceil(total / limit),
    
  };
};

// ---------------------------------------------------------------------------
// Get a single query — employee can only see their own
// ---------------------------------------------------------------------------
const getQueryById = async ({ queryId, userId, role }) => {
  const query = await Query.findById(queryId)
    .populate("assignedTo", "name email")
    .lean();

  if (!query) {
    const err = new Error("Query not found.");
    err.statusCode = 404;
    throw err;
  }

  // Employees can only read their own queries
  if (role === "employee" && query.employeeId.toString() !== userId.toString()) {
    const err = new Error("Access denied.");
    err.statusCode = 403;
    throw err;
  }

  return query;
};

// ---------------------------------------------------------------------------
// Admin: Get all queries (paginated + filterable)
// ---------------------------------------------------------------------------
const getAllQueries = async ({ page = 1, limit = 10, status, queryType, priority }) => {
  const filter = {};
  if (status)    filter.status    = status;
  if (queryType) filter.queryType = queryType;
  if (priority)  filter.priority  = priority;

  const skip  = (page - 1) * limit;
  const total = await Query.countDocuments(filter);

  const queries = await Query.find(filter)
    .populate("employeeId", "name email department")
    .populate("assignedTo",  "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    queries,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ---------------------------------------------------------------------------
// Admin: Update query status / assign / respond
// ---------------------------------------------------------------------------
const updateQuery = async ({ queryId, updates }) => {
  const allowed = ["status", "assignedTo", "responseMessage", "priority"];
  const sanitized = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) sanitized[key] = updates[key];
  }

  if (sanitized.status === "Resolved") {
    sanitized.resolvedAt = new Date();
  }

  const query = await Query.findByIdAndUpdate(
    queryId,
    { $set: sanitized },
    { new: true, runValidators: true }
  ).lean();

  if (!query) {
    const err = new Error("Query not found.");
    err.statusCode = 404;
    throw err;
  }

  return query;
};

// ---------------------------------------------------------------------------
// Admin: Delete a query
// ---------------------------------------------------------------------------
const deleteQuery = async (queryId) => {
  const query = await Query.findByIdAndDelete(queryId);
  if (!query) {
    const err = new Error("Query not found.");
    err.statusCode = 404;
    throw err;
  }
  return { message: "Query deleted successfully." };
};

// ---------------------------------------------------------------------------
// Stats (for admin dashboard widget)
// ---------------------------------------------------------------------------
const getQueryStats = async () => {
  const stats = await Query.aggregate([
    {
      $group: {
        _id:   "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const priorityStats = await Query.aggregate([
    {
      $group: {
        _id:   "$priority",
        count: { $sum: 1 },
      },
    },
  ]);

  return { statusStats: stats, priorityStats };
};

module.exports = {
  createQuery,
  getMyQueries,
  getQueryById,
  getAllQueries,
  updateQuery,
  deleteQuery,
  getQueryStats,
};