const mongoose = require("mongoose");

/**
 * IndividualSoftwareLicense Schema
 * Represents exactly ONE tracked seat or license key.
 * Only software with licenseType: "Subscription", "Licensed", or "Per Seat"
 * will use this database collection!
 */
const IndividualSoftwareLicenseSchema = new mongoose.Schema(
{
softwareId: {
type: mongoose.Schema.Types.ObjectId,
ref: "Software",
required: true
},
// The actual 16-digit license key, or just an internal tracking ID like "Adobe-Seat-01"
licenseKey: {
type: String,
required: true,
unique: true,
trim: true
},
// The human readable name derived from the parent for easy viewing
softwareName: {
type: String,
required: true
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
type: Date
}
},
{
timestamps: true
}
);

module.exports = mongoose.model("IndividualSoftware", IndividualSoftwareLicenseSchema);