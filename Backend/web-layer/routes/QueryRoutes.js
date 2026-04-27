const express = require("express");
const authMiddleware = require("../middlewares/AuthMiddleware");
const allowRoles = require("../middlewares/AllowRoles");

const queryRoutes  = express.Router();


const {
  submitQuery,
  getMyQueries,
  getQueryById,
  getAllQueries,
  updateQuery,
  deleteQuery,
  getQueryStats,
} = require("../controllers/QueryController");


// ─── All routes below require authentication ──────────────────────────────
queryRoutes.use(authMiddleware);
console.log("hello",authMiddleware);


// Employee routes
queryRoutes.post(  "/", allowRoles("Employee"),submitQuery);
queryRoutes.get( "/my",  allowRoles("Employee"),getMyQueries);

// Admin / IT routes
queryRoutes.get("/stats", allowRoles("Admin", "IT Operations"),getQueryStats);
queryRoutes.get("/",allowRoles("Admin", "IT Operations"),getAllQueries);
queryRoutes.patch("/:id",allowRoles("Admin", "IT Operations"),updateQuery);
queryRoutes.delete("/:id",allowRoles("Admin","IT Operations"),deleteQuery);

// Shared: employee (own) or admin/IT (any) — access control inside service
queryRoutes.get("/:id", allowRoles("Employee", "Admin", "IT Operations"), getQueryById);

module.exports = queryRoutes;