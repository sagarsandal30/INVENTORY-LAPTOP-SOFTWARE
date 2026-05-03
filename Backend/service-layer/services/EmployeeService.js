const Employee = require("../models/Employee");
const mongoose = require("mongoose");
const { getRedisClient } = require("../../Config/redisClient");

// =============================
// 🔹 Clear Cache
// =============================
const clearEmployeeListCache = async () => {
  const redisClient = getRedisClient();

  if (!redisClient || !redisClient.isOpen) return;

  const keys = [];

  for await (const key of redisClient.scanIterator({
    MATCH: "employee:list:*",
    COUNT: 100,
  })) {
    keys.push(key);
  }

  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};

const clearCommonCache = async () => {
  const redisClient = getRedisClient();

  if (!redisClient || !redisClient.isOpen) return;

  await redisClient.del("dashboard:data");
  await clearEmployeeListCache();
};

// =============================
// 🔹 CREATE Employee
// =============================
const createEmployee = async (employeeData) => {
  const existingEmployee = await Employee.findOne({
    email: employeeData.email,
  });

  if (existingEmployee) {
    if (employeeData.userId && !existingEmployee.userId) {
      existingEmployee.userId = employeeData.userId;
      await existingEmployee.save();
      return existingEmployee;
    }
    return existingEmployee;
  }

  const employee = await Employee.create(employeeData);

  await clearCommonCache();

  return employee;
};

// =============================
// 🔹 GET All Employees
// =============================
const getAllEmployee = async (page, limit, search, status) => {
  const redisClient = getRedisClient();
  const skip = (page - 1) * limit;

  const query = {};

  if (search && search.trim() !== "") {
    query.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { department: { $regex: search, $options: "i" } },
    ];
  }

  if (status && status !== "All") {
    query.status = status;
  }

  const cacheKey = `employee:list:page=${page}:limit=${limit}:search=${search}:status=${status}`;

  // 🔥 CACHE READ
  if (redisClient && redisClient.isOpen) {
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log("⚡ Employee from Redis");
      return JSON.parse(cachedData);
    }
  }

  console.log("🧠 Employee from MongoDB");

  const totalEmployees = await Employee.countDocuments();

  const employees = await Employee.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalEmployees / limit);

  const active = await Employee.countDocuments({ status: "Active" });
  const inActive = await Employee.countDocuments({ status: "Inactive" });

  const assetInfo = await Employee.aggregate([
    {
      $group: {
        _id: null,
        totalLaptops: { $sum: "$laptopAssigned" },
        totalSoftware: { $sum: "$softwareAssigned" },
      },
    },
  ]);

  const result = {
    employees,
    stats: {
      totalEmployees,
      active,
      inactive: inActive,
      totalLaptops: assetInfo[0]?.totalLaptops || 0,
      totalSoftware: assetInfo[0]?.totalSoftware || 0,
    },
    totalPages,
    currentPage: page,
  };

  // 🔥 CACHE SAVE
  if (redisClient && redisClient.isOpen) {
    await redisClient.setEx(cacheKey, 60, JSON.stringify(result));
  }

  return result;
};

// =============================
// 🔹 GET One Employee
// =============================
const getOneEmployee = async (id) => {
  const redisClient = getRedisClient();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid employee ID");
  }

  const cacheKey = `employee:${id}`;

  if (redisClient && redisClient.isOpen) {
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      console.log("⚡ Single Employee from Redis");
      return JSON.parse(cached);
    }
  }

  const employee = await Employee.findById(id);

  if (!employee) {
    throw new Error("Employee not found");
  }

  if (redisClient && redisClient.isOpen) {
    await redisClient.setEx(cacheKey, 60, JSON.stringify(employee));
  }

  return employee;
};

// =============================
// 🔹 UPDATE Employee
// =============================
const updateEmployee = async (id, data) => {
  const redisClient = getRedisClient();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid employee ID");
  }

  const updated = await Employee.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    throw new Error("Employee not found");
  }

  if (redisClient && redisClient.isOpen) {
    await redisClient.del(`employee:${id}`);
  }

  await clearCommonCache();

  return updated;
};

// =============================
// 🔹 DELETE Employee
// =============================
const deleteEmployee = async (id) => {
  const redisClient = getRedisClient();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid employee ID");
  }

  const deleted = await Employee.findByIdAndDelete(id);

  if (!deleted) {
    throw new Error("Employee not found");
  }

  if (redisClient && redisClient.isOpen) {
    await redisClient.del(`employee:${id}`);
  }

  await clearCommonCache();

  return deleted;
};

module.exports = {
  createEmployee,
  getAllEmployee,
  getOneEmployee,
  updateEmployee,
  deleteEmployee,
};