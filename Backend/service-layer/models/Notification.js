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
      enum: ["Unread", "Critical", "Warning", "Info", "Success"],
      default: "Info",
    },
// Used for Filtering tabs in UI
    category: {
      type: String,
      enum: ["Software", "Laptop", "Assignment", "System", "Query"],
      required: true,
    },

    dept: {
      type: String,
      default: "IT Ops",
    },
    time:{
      type: Date,
      default: Date.now,

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