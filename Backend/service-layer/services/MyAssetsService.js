const Assignment = require("../models/Assignment");
const Employee = require("../models/Employee");
const LaptopAsset = require("../models/Laptop");
const IndividualSoftware = require("../models/IndividualSoftware");

const getMyAssets = async (userId) => {
    // 1. Find the employee record for this user
    const employee = await Employee.findOne({ userId });
    if (!employee) {
        throw new Error("Employee record not found for this user");
    }

    // 2. Fetch all active assignments for this employee
    const assignments = await Assignment.find({ 
        employeeId: employee._id,
        status: "Assigned"
    }).sort({ assignDate: -1 });

    // 3. Format the data for the frontend
    // We could potentially populate more details here if needed
    const formattedAssets = assignments.map(asset => ({
        id: asset._id,
        assetType: asset.assetType,
        assetName: asset.assetName,
        serialNumber: asset.assetName, // In Assignments, assetName is the serial/license key
        assignedDate: asset.assignDate,
        status: asset.status
    }));

    return formattedAssets;
};

module.exports = { getMyAssets };
