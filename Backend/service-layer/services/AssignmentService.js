const Assignment = require("../models/Assignment");
const Software = require("../models/Software");
const Employee = require("../models/Employee");
const LaptopAsset = require("../models/Laptop");
const LaptopModel = require("../models/LaptopModel");
const mongoose = require("mongoose");
const {
  returnAssignment,
} = require("../../web-layer/controllers/AssignmentController");
const Laptop = require("../models/Laptop");

const create = async (assignData) => {
  const {
    employeeId,
    assetType,
    laptopModelId,
    laptopAssetId,
    softwareId,
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

    // update employee
    employee.laptopAssigned = (employee.laptopAssigned || 0) + 1;
    await employee.save();

    return assignment;
  }

  if (assetType === "Software") {
    if (!softwareId) {
      throw new Error("Software ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(softwareId)) {
      throw new Error("Invalid Software ID");
    }

    const software = await Software.findById(softwareId);
    if (!software) {
      throw new Error("Software not found");
    }

    assetName = software.softwareName;

    const assignment = await Assignment.create({
      employeeId,
      employeeName: employee.fullName,
      assetType,
      laptopModelId: null,
      laptopAssetId: null,
      softwareId,
      assetName,
      assignDate,
        assignedBy,
      status: "Assigned",
    });

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
  const assignments = await Assignment.find(filter).sort({createdAt:-1}).skip(skip).limit(limit);
  console.log("hello", assignments);
  const totalPages = Math.ceil(totalAssignments / limit);

  return {
    assignments,
    stats: {
      totalAssignments,
    },
    currentPage: page,
    totalPages,
  };
};
const fetchById = async (AssetId) => {
  const assetById = await Assignment.findOne();
  return assetById;
};

//Assignemnt Return
const assignmentReturn = async (assignmentId) => {
  const returnassignment = await Assignment.findById(assignmentId);
  if (!returnassignment) {
    throw new Error("Assignment is not found ");
  }
  if (returnassignment.status == "Returned") {
    throw new Error("Assignment is already Returned");
  }
  returnassignment.status = "Returned";
  returnassignment.returnDate = new Date();

  //  const employeeId=returnassignment.employeeId.toString();
  // const employee=await Employee.findById(employeeId);
  const laptopAsset = await Laptop.findById(returnassignment.laptopAssetId);
  laptopAsset.assignedTo = returnassignment.employeeId;
  await laptopAsset.save();
  await returnassignment.save();

  const returnedAssignemnt = await Assignment.findByIdAndUpdate(
    { assignmentId, status: "Avaliable", assignedTo: null },
    {
      new: true,
      runValidators: true,
    },
  );
  return returnedAssignemnt;
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

module.exports = { create ,fetch,fetchById,assignmentReturn,avaliableEmployee};