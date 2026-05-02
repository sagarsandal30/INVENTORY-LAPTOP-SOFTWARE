const Employee = require("../models/Employee");
const mongoose = require("mongoose");
const {redisClient}=require("../../Config/redisClient")

// Clear all employee list cache keys
const clearEmployeeListCache = async () => {
  const keys = await redisClient.keys("employee:list:*");

  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};


// CREATE Employee
const createEmployee = async (employeeData) => {
  // Check if employee with same email already exists (safety for auto-creation)
  const existingEmployeeByEmail = await Employee.findOne({
    email: employeeData.email
  });

  if (existingEmployeeByEmail) {
    // If it already exists and we are trying to link a user, update the userId
    if (employeeData.userId && !existingEmployeeByEmail.userId) {
      existingEmployeeByEmail.userId = employeeData.userId;
      await existingEmployeeByEmail.save();
      return existingEmployeeByEmail;
    }
    return existingEmployeeByEmail; // Return existing one instead of throwing if it's an auto-call
  }

  const employee = await Employee.create(employeeData);
  
  // clear cache
  await redisClient.del("dashboard:data");
  await clearEmployeeListCache();
  
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

  const cacheKey = `employee:list:page=${page}:limit=${limit}:search=${search}:status=${status}`;
  const cachedData = await redisClient.get(cacheKey);
   if(!cachedData){
    console.log("Employee list from MongoDB");
   }
    if (cachedData) {
    console.log("Employee list from Redis");
    return JSON.parse(cachedData);
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
    
const result= {
  employees,
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
  await redisClient.setEx(cacheKey,60,JSON.stringify(result));
  return result;
    
};

// GET One Employee by ID
const getOneEmployee = async (employeeMongoId) => {
  if (!mongoose.Types.ObjectId.isValid(employeeMongoId)) {
    throw new Error("Invalid employee ID.");
  }

  const cacheKey = `employee:${employeeMongoId}`;
    const cachedEmployee = await redisClient.get(cacheKey);
if (cachedEmployee) {
    console.log("Single employee from Redis");
    return JSON.parse(cachedEmployee);
  }



  const employee = await Employee.findById(employeeMongoId);

  if (!employee) {
    throw new Error("Employee not found.");
  }
await redisClient.setEx(cacheKey,60,JSON.stringify(employee));
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
    await redisClient.del("dashboard:data");
  await redisClient.del(`employee:${employeeMongoId}`);
    await clearEmployeeListCache();

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

    // 🔥 clear cache here
    await redisClient.del("dashboard:data");
  await redisClient.del(`employee:${employeeMongoId}`);
    await clearEmployeeListCache();

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