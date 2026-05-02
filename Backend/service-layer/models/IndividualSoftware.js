const mongoose = require("mongoose");

const IndividualSoftwareLicenseSchema = new mongoose.Schema(
{
 softwareModelId: {
 type: mongoose.Schema.Types.ObjectId,
 ref: "Software",
 required: true
 },
 licenseKey: {
 type: String,
 required: true,
 unique: true,
  trim: true
},

status: {
type: String,
enum: ["Available", "Assigned", "Expired"],
default: "Available"
},
assignedTo: {
type: mongoose.Schema.Types.ObjectId,
ref: "Employee",
default: null
},
  expiryDate: {
      type: Date,
    },
  renewalStatus:{
  type: String,
  enum: ["Active", "Expiring Soon", "Critical", "Expired"],
  default: "Active"
}
},
{
timestamps: true
}
);

module.exports = mongoose.model("IndividualSoftware", IndividualSoftwareLicenseSchema);