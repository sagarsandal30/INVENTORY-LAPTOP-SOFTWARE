const Employee = require("../models/Employee");
const mongoose = require("mongoose");

// CREATE Employee
const createEmployee = async (employeeData) => {
  const existingEmployeeById = await Employee.findOne({
    _id: employeeData._id
  });

  if (existingEmployeeById) {
    throw new Error("Employee with this employee ID already exists.");
  }

  const existingEmployeeByEmail = await Employee.findOne({
    email: employeeData.email
  });

  if (existingEmployeeByEmail) {
    throw new Error("Employee with this email already exists.");
  }

  const employee = await Employee.create(employeeData);
  return employee;
};

// GET All Employees
const getAllEmployee = async (page,limit,search,status) => {
  const skip = (page - 1) * limit;

  const query={};

  // Search by fullName OR email OR department
  if (search && search.trim() !== "") {
    query.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { department: { $regex: search, $options: "i" } },
    ];
  }

  //Filter By Status
  if(status&&status!=="All"){
    query.status=status;
  }
const totalEmployees= await Employee.countDocuments();
console.log(totalEmployees);
  const employees = await Employee.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
  const totalPages=Math.ceil(totalEmployees/limit);
  const active=await Employee.countDocuments({status:"Active"});
    const inActive=await Employee.countDocuments({status:"Inactive"});
    const assetInfo=await Employee.aggregate([
      {
        $group:{
          _id:null,
          totalLaptops:{$sum:"$laptopAssigned"},
          totalSoftware:{$sum:"$softwareAssigned"}
        }
      }
    ]);
    
return {employees,
   stats:{
    totalEmployees:totalEmployees,
    active:active,
    inactive:inActive,
    totalLaptops:assetInfo[0]?.totalLaptops,
    totalSoftware:assetInfo[0]?.totalSoftware
},
totalPages,
currentPage:page
}
  // return {employees,totalEmployees,totalPages,currentPage:page};
    
};

// GET One Employee by ID
const getOneEmployee = async (employeeMongoId) => {
  if (!mongoose.Types.ObjectId.isValid(employeeMongoId)) {
    throw new Error("Invalid employee ID.");
  }

  const employee = await Employee.findById(employeeMongoId);

  if (!employee) {
    throw new Error("Employee not found.");
  }

  return employee;
};

// UPDATE Employee
const updateEmployee = async (employeeMongoId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(employeeMongoId)) {
    throw new Error("Invalid employee ID.");
  }

  const updatedEmployee = await Employee.findByIdAndUpdate(
    employeeMongoId,
    updateData,
    {
      new: true,
      runValidators: true
    }
  );

  if (!updatedEmployee) {
    throw new Error("Employee not found.");
  }

  return updatedEmployee;
};

// DELETE Employee
const deleteEmployee = async (employeeMongoId) => {


  if (!mongoose.Types.ObjectId.isValid(employeeMongoId)) {
    throw new Error("Invalid employee ID.");
  }

  const deletedEmployee = await Employee.findByIdAndDelete(employeeMongoId);

  if (!deletedEmployee) {
    throw new Error("Employee not found.");
  }

  return deletedEmployee;
};

   

module.exports ={
    createEmployee,
    getAllEmployee,
    getOneEmployee,
    updateEmployee,
    deleteEmployee,
      
};