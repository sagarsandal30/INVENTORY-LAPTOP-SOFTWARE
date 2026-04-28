const express = require("express");
const authMiddleware = require("../middlewares/AuthMiddleware");
const allowRoles = require("../middlewares/AllowRoles");

const notificationRoutes  = express.Router();


const {getMyNotifications,deleteNotification,markAllRead,markRead} = require("../controllers/NotificationController");
notificationRoutes.use(authMiddleware);
// Employee routes
notificationRoutes.get("/", allowRoles("Admin","IT Operations"), getMyNotifications);
notificationRoutes.put("/read", allowRoles("Admin","IT Operations"),markAllRead);
notificationRoutes.patch("/:id", allowRoles("Admin","IT Operations"),markRead);

notificationRoutes.delete("/:id", allowRoles("Admin","IT Operations"), deleteNotification);

module.exports = notificationRoutes;