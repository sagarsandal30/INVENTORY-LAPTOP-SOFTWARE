const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["critical", "warning", "info", "success"],
      default: "info",
    },
// Used for Filtering tabs in ui
    category: {
      type: String,
      enum: ["Software", "Laptop", "Assignment", "System", "Query"],
      required: true,
    },

    dept: {
      type: String,
      default: "IT Ops",
    },

    read: {
      type: Boolean,
      default: false,
    },

    action: {
      type: String,
      default: "View Details",
    },

    targetRole: {
      type: String,
      enum: ["Admin", "IT Operations", "Manager", "Employee"],
      default: "IT Operations",
    },

    relatedModel: {
      type: String,
      enum: ["Query", "Software", "Laptop", "Assignment", "Employee", "System"],
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);