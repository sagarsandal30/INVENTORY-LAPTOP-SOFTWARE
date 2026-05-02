const express = require("express");
const aiRouter = express.Router();
const authMiddleware = require("../middlewares/AuthMiddleware");
const allowRoles = require("../middlewares/AllowRoles");
const {
  predictFailure,
  getHighRiskLaptops,
  getBrandFailureAnalysis
} = require("../controllers/AiController");

// Authentication middleware for all AI routes
aiRouter.use(authMiddleware);

// POST /api/ai/predict-failure/:assetId -> Run AI analysis for one laptop
aiRouter.post("/predict-failure/:assetId", allowRoles("Admin", "IT Operations"), predictFailure);

// GET /api/ai/high-risk-laptops -> Return laptops where riskLevel is High or Critical
aiRouter.get("/high-risk-laptops", allowRoles("Admin", "IT Operations"), getHighRiskLaptops);

// GET /api/ai/brand-failure-analysis -> Calculate failure rate per brand
aiRouter.get("/brand-failure-analysis", allowRoles("Admin", "IT Operations"), getBrandFailureAnalysis);

module.exports = aiRouter;
