const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    department: {
      type: String,
      enum: [
        "Engineering",
        "IT Operations",
        "Human Resources",
        "Finance",
        "Marketing",
        "Sales",
        "Design",
        "Quality Assurance",
        "Customer Support",
        "Analytics",
        "Legal",
        "Administration",
      ],
      required: false,
    },
    role: {
      type: String,
      enum: ["Employee", "Admin", "Manager", "IT Operations"],
      default: "Employee",
      required: false,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    location: {
      type: String,
      enum: [
        "Mumbai",
        "Delhi",
        "Bangalore",
        "Hyderabad",
        "Chennai",
        "Pune",
        "Ahmedabad",
        "Kochi",
        "Not Assigned",
      ],
      default: "Not Assigned",
      required: false,
    },
    joinDate: {
      type: Date,
      default: Date.now,
      required: false,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    laptopAssigned: {
      type: Number,
      default: 0,
    },
    softwareAssigned: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Employee", EmployeeSchema);