const express = require("express");
const router = express.Router();
const { getMyAssignedAssets } = require("../controllers/MyAssetsController");
const authMiddleware = require("../middlewares/AuthMiddleware");

// GET /api/my-assets
// Accessible by logged in employees
router.get("/", authMiddleware, getMyAssignedAssets);

module.exports = router;
