const mongoose = require("mongoose");

const RepairHistorySchema = new mongoose.Schema(
  {
    laptopAssetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LaptopAsset",
      required: true
    },
    issueDescription: {
      type: String,
      required: true,
      trim: true
    },
    repairCost: {
      type: Number,
      required: true,
      min: 0
    },
    repairDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("RepairHistory", RepairHistorySchema);
