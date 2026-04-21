const express=require("express");
const dashboardRouter = express.Router();
const authMiddleware = require("../middlewares/AuthMiddleware");
const fetchDashboardData = require("../controllers/DashboardController");

const allowRoles = require("../middlewares/AllowRoles");

dashboardRouter.use(authMiddleware);

dashboardRouter.get("/dashboard",allowRoles("Admin","Manager"),fetchDashboardData);


module.exports=dashboardRouter;