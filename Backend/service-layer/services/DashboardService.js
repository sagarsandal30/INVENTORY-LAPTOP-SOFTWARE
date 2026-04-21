const Assignment = require("../models/Assignment");
const Software = require("../models/Software");
const Employee = require("../models/Employee");
const LaptopAsset = require("../models/Laptop");
const LaptopModel = require("../models/LaptopModel");
const mongoose = require("mongoose");

 const showDashboardData= async()=>{
   const totalLaptops= await LaptopAsset.countDocuments();
   const totalSoftware=await Software.countDocuments();
   const activeEmployees=await Employee.countDocuments({status:"Active"});
   const totalAssignemnts=await Assignment.countDocuments({status:"Assigned"});
   const totalEmployees=await Employee.countDocuments();
   const avaliableLaptops=await LaptopAsset.countDocuments({status:"Available"});
 const underRepairLaptops=await LaptopAsset.countDocuments({status:"Under Repair"});
 const assignedLaptops=await LaptopAsset.countDocuments({status:"Assigned"});

const recentAssignments = await Assignment.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("employeeId", "fullName")
    .populate("laptopAssetId", "serialNumber")


  // =========================
  // 3. Format Recent Activity
  // =========================
  const recentActivity = recentAssignments.map((assignment) => {
     let action = "";
    let item = "";
    let employee = assignment.employeeId?.fullName || "Unknown Employee";
    let status = "success";

      if (assignment.assetType === "Laptop") {
         action = assignment.status === "Returned"? "Laptop returned" : "Laptop assigned";
      item= assignment.laptopAssetId?.serialNumber
      }
      if (assignment.assetType === "Software") {
      action =assignment.status === "Returned"? "Software returned": "Software assigned";
  item = assignment.softwareId?.assetName ;
      }
      if (assignment.status === "Returned") {
      status = "warning";
    }
     return {
      id: assignment._id,
      action,
      item,
      employee,
      time: formatTimeAgo(assignment.createdAt),
      status,
    };
  });

   return{
    stats:{
        totalLaptops,
        totalSoftware,
        activeEmployees,
        totalAssignemnts,
        totalEmployees,
        avaliableLaptops,
        underRepairLaptops,
        assignedLaptops  
    },
    recentActivity
   };
}

// =========================
// Helper function
// =========================
const formatTimeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now - past;

  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
  }

  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
  }

  return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
};
module.exports=showDashboardData;