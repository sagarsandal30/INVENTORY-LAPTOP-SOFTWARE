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
      enum: ["Available", "Assigned", "Under Repair","Retired"],
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
    aiMetrics: {
      predictionScore: { type: Number, min: 0, max: 100 },
      riskLevel: { type: String, enum: ["Low", "Medium", "High", "Critical"] },
      reason: { type: String },
      aiRecommendation: { type: String },
      lastPredictionDate: { type: Date }
    },
    purchaseDate: {
      type: Date,
      default: Date.now
    },
    isNearEOL: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("LaptopAsset", LaptopAssetSchema);