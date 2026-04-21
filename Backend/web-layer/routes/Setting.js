const express = require("express");
const settingsRouter = express.Router();

const authMiddleware = require("../middlewares/AuthMiddleware");

const {
  getProfile,
  updateProfile,
  updateProfilePhoto,
} = require("../controllers/SettingController");

settingsRouter.use(authMiddleware);

settingsRouter.get("/profile", getProfile);
settingsRouter.put("/profile", updateProfile);


module.exports = settingsRouter;