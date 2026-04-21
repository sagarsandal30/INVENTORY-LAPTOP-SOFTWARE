const mongoose = require("mongoose");

const LaptopAssetSchema = new mongoose.Schema(
  {
    laptopModelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LaptopModel",
      required: true
    },

    serialNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    modelName:{
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Avaliable", "Assigned", "Under Repair"],
      default: "Available"
    },

    condition: {
      type: String,
      enum: ["Good", "Damaged", "Needs Repair"],
      default: "Good"
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null
    },
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("LaptopAsset", LaptopAssetSchema);