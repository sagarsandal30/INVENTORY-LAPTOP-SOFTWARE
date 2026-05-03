const Assignment = require("../models/Assignment");
const Software = require("../models/Software");
const Employee = require("../models/Employee");
const LaptopAsset = require("../models/Laptop");
const LaptopModel = require("../models/LaptopModel");
const mongoose = require("mongoose");
const IndividualSoftware = require("../models/IndividualSoftware");
const Laptop = require("../models/Laptop");

const create = async (assignData) => {
  const {
    employeeId,
    assetType,
    laptopModelId,
    laptopAssetId,
    softwareId,
    softwareAssetId, // Added this
    assignDate,
    assignedBy,
  } = assignData;

  if (!employeeId || !assetType || !assignDate) {
    throw new Error("Employee, asset type and assign date are required");
  }

  if (!mongoose.Types.ObjectId.isValid(employeeId)) {
    throw new Error("Invalid employee ID");
  }

  const employee = await Employee.findById(employeeId);
  if (!employee) {
    throw new Error("Employee not found");
  }

  let assetName = "";

  if (assetType === "Laptop") {
    // ... laptop logic ...
    if (!laptopModelId) {
      throw new Error("Laptop Model ID is required");
    }

    if (!laptopAssetId) {
      throw new Error("Laptop Asset ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(laptopModelId)) {
      throw new Error("Invalid Laptop Model ID");
    }

    if (!mongoose.Types.ObjectId.isValid(laptopAssetId)) {
      throw new Error("Invalid Laptop Asset ID");
    }

    const laptopModel = await LaptopModel.findById(laptopModelId);
    if (!laptopModel) {
      throw new Error("Laptop Model not found");
    }

    const laptopAsset = await LaptopAsset.findById(laptopAssetId);
    if (!laptopAsset) {
      throw new Error("Laptop Asset not found");
    }

    if (laptopAsset.status !== "Available") {
      throw new Error("This laptop asset is not available");
    }

    const existingLaptopAssignment = await Assignment.findOne({
      employeeId,
      assetType: "Laptop",
      status: "Assigned",
    });

    if (existingLaptopAssignment) {
      throw new Error("Employee already has a laptop assigned");
    }

    assetName = laptopAsset.serialNumber;

    const assignment = await Assignment.create({
      employeeId,
      employeeName: employee.fullName,
      assetType,
      laptopModelId,
      laptopAssetId,
      softwareId: null,
      assetName,
      assignDate,
      assignedBy,
      status: "Assigned",
    });

    // update laptop asset
    laptopAsset.status = "Assigned";
    laptopAsset.assignedTo = employeeId;
    await laptopAsset.save();

    // update laptop model counts
    laptopModel.avaliable = Math.max(0, (laptopModel.avaliable || 0) - 1);
    laptopModel.inUse = (laptopModel.inUse || 0) + 1;
    await laptopModel.save();

    // update employee
    employee.laptopAssigned = (employee.laptopAssigned || 0) + 1;
    await employee.save();

    return assignment;
  }

  if (assetType === "Software") {
    if (!softwareAssetId) {
      throw new Error("Software License ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(softwareAssetId)) {
      throw new Error("Invalid Software License ID");
    }

    // Find the individual license
    const license = await IndividualSoftware.findById(softwareAssetId).populate("softwareModelId");
    if (!license) {
      throw new Error("Software License not found");
    }

    if (license.status !== "Available") {
      throw new Error("This software license is not available");
    }

    const softwareModel = await Software.findById(license.softwareModelId);
    if (!softwareModel) {
      throw new Error("Software model not found");
    }

    assetName = license.licenseKey; // Set asset name as license key

    const assignment = await Assignment.create({
      employeeId,
      employeeName: employee.fullName,
      assetType,
      laptopModelId: null,
      laptopAssetId: null,
      softwareId: softwareModel._id, // Keep software model ID for stats
      softwareAssetId: license._id, // Store the specific license ID
      assetName,
      assignDate,
      assignedBy,
      status: "Assigned",
    });

    // update individual software status
    license.status = "Assigned";
    license.assignedTo = employeeId;
    await license.save();

    // update software model counts
    softwareModel.usedLicenses = (softwareModel.usedLicenses || 0) + 1;
    await softwareModel.save();

    // update employee
    employee.softwareAssigned = (employee.softwareAssigned || 0) + 1;
    await employee.save();

    return assignment;
  }

  throw new Error("Invalid asset type");
};

// Get All Assignments

const fetch = async (page, limit, search, assetType, assetStatus) => {
  const skip = (page - 1) * limit;

  const filter = {};

  if (search && search.trim() !== "") {
    filter.$or = [
      { employeeName: { $regex: search, $options: "i" } },
      { assetName: { $regex: search, $options: "i" } },
    ];
  }
  //AssetType
  if (assetType && assetType !== "All") {
    filter.assetType = assetType;
  }
  //Asset Status
  if (assetStatus && assetStatus.trim() !== "All") {
    filter.status = assetStatus;
  }

  const totalAssignments = await Assignment.countDocuments();
  const activeAssignments = await Assignment.countDocuments({ status: "Assigned" });
  const returnedAssignments = await Assignment.countDocuments({ status: "Returned" });
  const laptopsAssigned = await Assignment.countDocuments({ status: "Assigned", assetType: "Laptop" });
  const softwareAssigned = await Assignment.countDocuments({ status: "Assigned", assetType: "Software" });

  const assignments = await Assignment.find(filter).sort({createdAt:-1}).skip(skip).limit(limit);
  const totalPages = Math.ceil(totalAssignments / limit);

  return {
    assignments,
    stats: {
      totalAssignments,
      activeAssignments,
      returnedAssignments,
      laptopsAssigned,
      softwareAssigned,
    },
    currentPage: page,
    totalPages,
  };
};
const fetchById = async (AssetId) => {
  const assetById = await Assignment.findById(AssetId);
  return assetById;
};

// Remove Assignment
const remove = async (assignmentId) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new Error("Assignment not found");
  }

  // If it's still assigned, we should update the assets before deleting the record
  if (assignment.status === "Assigned") {
    // Update Employee counts
    const employee = await Employee.findById(assignment.employeeId);
    if (employee) {
      if (assignment.assetType === "Laptop") {
        employee.laptopAssigned = Math.max(0, (employee.laptopAssigned || 0) - 1);
      } else {
        employee.softwareAssigned = Math.max(0, (employee.softwareAssigned || 0) - 1);
      }
      await employee.save();
    }

    // Update Asset specific collections
    if (assignment.assetType === "Laptop") {
      const laptopAsset = await LaptopAsset.findById(assignment.laptopAssetId);
      if (laptopAsset) {
        laptopAsset.status = "Available";
        laptopAsset.assignedTo = null;
        await laptopAsset.save();

        // Update Model counts
        const laptopModel = await LaptopModel.findById(assignment.laptopModelId);
        if (laptopModel) {
          laptopModel.avaliable = (laptopModel.avaliable || 0) + 1;
          laptopModel.inUse = Math.max(0, (laptopModel.inUse || 0) - 1);
          await laptopModel.save();
        }
      }
    } else if (assignment.assetType === "Software") {
      if (assignment.softwareAssetId) {
        const license = await IndividualSoftware.findById(assignment.softwareAssetId);
        if (license) {
          license.status = "Available";
          license.assignedTo = null;
          await license.save();
        }
      }

      const software = await Software.findById(assignment.softwareId);
      if (software) {
        software.usedLicenses = Math.max(0, (software.usedLicenses || 0) - 1);
        await software.save();
      }
    }
  }

  await Assignment.findByIdAndDelete(assignmentId);
  return { message: "Assignment deleted successfully" };
};

//Assignemnt Return
const assignmentReturn = async (assignmentId) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new Error("Assignment not found");
  }
  if (assignment.status === "Returned") {
    throw new Error("Assignment is already Returned");
  }

  const now = new Date();
  assignment.status = "Returned";
  assignment.returnDate = now;
  await assignment.save();

  // Update Employee counts
  const employee = await Employee.findById(assignment.employeeId);
  if (employee) {
    if (assignment.assetType === "Laptop") {
      employee.laptopAssigned = Math.max(0, (employee.laptopAssigned || 0) - 1);
    } else {
      employee.softwareAssigned = Math.max(0, (employee.softwareAssigned || 0) - 1);
    }
    await employee.save();
  }

  // Update Asset specific collections
  if (assignment.assetType === "Laptop") {
    const laptopAsset = await LaptopAsset.findById(assignment.laptopAssetId);
    if (laptopAsset) {
      laptopAsset.status = "Available";
      laptopAsset.assignedTo = null;
      await laptopAsset.save();

      // Update Model counts
      const laptopModel = await LaptopModel.findById(assignment.laptopModelId);
      if (laptopModel) {
        laptopModel.avaliable = (laptopModel.avaliable || 0) + 1;
        laptopModel.inUse = Math.max(0, (laptopModel.inUse || 0) - 1);
        await laptopModel.save();
      }
    }
  } else if (assignment.assetType === "Software") {
    // Update individual license status if present
    if (assignment.softwareAssetId) {
      const license = await IndividualSoftware.findById(assignment.softwareAssetId);
      if (license) {
        license.status = "Available";
        license.assignedTo = null;
        await license.save();
      }
    }

    const software = await Software.findById(assignment.softwareId);
    if (software) {
      software.usedLicenses = Math.max(0, (software.usedLicenses || 0) - 1);
      await software.save();
    }
  }

  return assignment;
};

//  Read Employees Who are Avaliable
   const avaliableEmployee=async()=>{
const employees = await Employee.find({status:"Active"});
  if (!employees) {
    const error = new Error("Employee not found");
    throw error;
  }
  console.log(employees);
  return employees;
   };

module.exports = { create, fetch, fetchById, assignmentReturn, avaliableEmployee, remove };