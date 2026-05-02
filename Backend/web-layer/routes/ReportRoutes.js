const express = require("express");
const reportRouter = express.Router();
const authMiddleware = require("../middlewares/AuthMiddleware");
const allowRoles = require("../middlewares/AllowRoles");
const { getReports } = require("../controllers/ReportController");

reportRouter.use(authMiddleware);

// Only Admin and IT Operations can see reports
reportRouter.get("/", allowRoles("Admin", "IT Operations"), getReports);

module.exports = reportRouter;
