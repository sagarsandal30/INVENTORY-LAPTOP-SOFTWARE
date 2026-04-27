const queryService = require("../../service-layer/services/QueryService");

// Helper — wraps async route handlers
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ---------------------------------------------------------------------------
// POST /api/queries
// Employee: Submit a new query
// ---------------------------------------------------------------------------
const submitQuery = asyncHandler(async (req, res) => {
  
  const params = {
    id:req.user.id,
    
  };  
 
  const query = await queryService.createQuery(req.body,params);

  res.status(201).json({
    success: true,
    message: "Query submitted successfully. You will receive a confirmation email shortly.",
    query,
  });
});

// ---------------------------------------------------------------------------
// GET /api/queries/my
// Employee: Get their own queries (paginated)
// ---------------------------------------------------------------------------
const getMyQueries = asyncHandler(async (req, res) => {
  const userId=req.user.id;
  const { page, limit, status } = req.query;

  const result = await queryService.getMyQueries(userId,page, limit, status);

  res.status(200).json({
    success: true,
    ...result,
  });
});

// ---------------------------------------------------------------------------
// GET /api/queries/:id
// Employee (own) or Admin/IT (any)
// ---------------------------------------------------------------------------
const getQueryById = asyncHandler(async (req, res) => {
  const query = await queryService.getQueryById({
    queryId: req.params.id,
    userId:  req.user._id,
    role:    req.user.role,
  });

  res.status(200).json({ success: true, data: query });
});

// ---------------------------------------------------------------------------
// GET /api/queries  (admin/IT only)
// ---------------------------------------------------------------------------
const getAllQueries = asyncHandler(async (req, res) => {
  try{
    const { page, limit , status, queryType, priority } = req.query;
  
  const result = await queryService.getAllQueries(page, limit , status, queryType, priority);
   
  res.status(200).json({
     success: true,
      ...result
     });
    }catch(error){
      res.status(400).json({ 
        success: false,
         message: error.message 
        });
    }
  
});

// ---------------------------------------------------------------------------
// PATCH /api/queries/:id  (admin/IT only)
// ---------------------------------------------------------------------------
const updateQuery = asyncHandler(async (req, res) => {
  const query = await queryService.updateQuery({
    queryId: req.params.id,
    updates: req.body,
  });

  res.status(200).json({
    success: true,
    message: "Query updated successfully.",
    data: query,
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/queries/:id  (admin only)
// ---------------------------------------------------------------------------
const deleteQuery = asyncHandler(async (req, res) => {
  const result = await queryService.deleteQuery(req.params.id);
  res.status(200).json({ success: true, ...result });
});

// ---------------------------------------------------------------------------
// GET /api/queries/stats  (admin/IT only)
// ---------------------------------------------------------------------------
const getQueryStats = asyncHandler(async (req, res) => {
  const stats = await queryService.getQueryStats();
  res.status(200).json({ success: true, data: stats });
});

module.exports = {
  submitQuery,
  getMyQueries,
  getQueryById,
  getAllQueries,
  updateQuery,
  deleteQuery,
  getQueryStats,
};