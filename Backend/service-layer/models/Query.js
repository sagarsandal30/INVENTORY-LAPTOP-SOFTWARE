const mongoose = require("mongoose");

const querySchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // Always extracted from JWT — never trusted from frontend
    },
    employeeName: {
      type: String,
      required: true,
    },
    employeeEmail: {
      type: String,
      required: true,
    },
    queryType: {
      type: String,
      enum: [
        "New Laptop Request",
        "Laptop Replacement",
        "Laptop Issue / Repair",
        "Software Installation Request",
        "Software Access Request",
        "General IT Query",
      ],
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Rejected"],
      default: "Pending",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    responseMessage: {
      type: String,
      default: null,
      trim: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for fast lookups by employee
querySchema.index({ employeeId: 1, createdAt: -1 });
querySchema.index({ status: 1 });

module.exports = mongoose.model("Query", querySchema);
