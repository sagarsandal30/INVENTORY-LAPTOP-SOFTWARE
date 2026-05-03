const LaptopModel = require("../models/LaptopModel");
const LaptopAsset = require("../models/Laptop");
const { getRedisClient } = require("../../Config/redisClient");

// =============================
// 🔹 Clear Cache
// =============================
const clearLaptopModelCache = async () => {
  const redisClient = getRedisClient();

  if (!redisClient || !redisClient.isOpen) return;

  const keys = [];

  for await (const key of redisClient.scanIterator({
    MATCH: "laptopModel:list:*",
    COUNT: 100,
  })) {
    keys.push(key);
  }

  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};

// =============================
// 🔹 CREATE Laptop Model
// =============================
const createLaptopModel = async (laptopData) => {
  const redisClient = getRedisClient();

  const existingLaptop = await LaptopModel.findOne({
    modelName: laptopData.modelName,
  });

  if (existingLaptop) {
    throw new Error("Laptop model already exists.");
  }

  const totalAssets = parseInt(laptopData.totalAssets) || 0;

  laptopData.avaliable = totalAssets;
  laptopData.inUse = 0;
  laptopData.underRepair = 0;
  laptopData.retired = 0;

  const laptop = new LaptopModel(laptopData);
  await laptop.save();

  // Create physical assets
  if (totalAssets > 0) {
    const assets = [];
    const brandPrefix = laptop.brand.substring(0, 3).toUpperCase();
    const modelPrefix = laptop.modelName.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);

    for (let i = 1; i <= totalAssets; i++) {
      assets.push({
        laptopModelId: laptop._id,
        serialNumber: `${brandPrefix}-${modelPrefix}-${timestamp}-${String(i).padStart(3, "0")}`,
        status: "Available",
        condition: "Good",
        modelName: laptop.modelName,
      });
    }

    await LaptopAsset.insertMany(assets);
  }

  // 🔥 Clear cache
  if (redisClient && redisClient.isOpen) {
    await redisClient.del("dashboard:data");
    await clearLaptopModelCache();
  }

  return laptop;
};

// =============================
// 🔹 GET ALL Laptop Models
// =============================
const getLaptopModel = async (page, limit, search) => {
  const redisClient = getRedisClient();

  const skip = (page - 1) * limit;

  const filter = {};
  if (search && search.trim() !== "") {
    filter.$or = [
      { modelName: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
    ];
  }

  const cacheKey = `laptopModel:list:page=${page}:limit=${limit}:search=${search}`;

  // 🔥 GET CACHE
  if (redisClient && redisClient.isOpen) {
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log("⚡ Laptop Model from Redis");
      return JSON.parse(cachedData);
    }
  }

  console.log("🧠 Laptop Model from MongoDB");

  const totalModels = await LaptopModel.countDocuments();

  const allLaptopModels = await LaptopModel.find();

  const existingLaptop = await LaptopModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const stats = await LaptopModel.aggregate([
    {
      $group: {
        _id: null,
        totalAssets: { $sum: "$totalAssets" },
        totalAvailable: { $sum: "$avaliable" },
        totalInUse: { $sum: "$inUse" },
        totalUnderRepair: { $sum: "$underRepair" },
      },
    },
  ]);

  const result = {
    allLaptopModels,
    existingLaptop,
    stats: {
      totalModels,
      totalAssets: stats[0]?.totalAssets || 0,
      totalAvailable: stats[0]?.totalAvailable || 0,
      totalInUse: stats[0]?.totalInUse || 0,
      totalUnderRepair: stats[0]?.totalUnderRepair || 0,
    },
    totalPages: Math.ceil(totalModels / limit),
    currentPage: page,
  };

  // 🔥 SAVE CACHE
  if (redisClient && redisClient.isOpen) {
    await redisClient.setEx(cacheKey, 60, JSON.stringify(result));
  }

  return result;
};

// =============================
// 🔹 GET ONE Laptop Model
// =============================
const getOneLaptopModel = async (laptopId) => {
  const redisClient = getRedisClient();

  const cacheKey = `laptopModel:${laptopId}`;

  if (redisClient && redisClient.isOpen) {
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      console.log("⚡ Single Laptop from Redis");
      return JSON.parse(cached);
    }
  }

  const singleLaptop = await LaptopModel.findById(laptopId);

  if (!singleLaptop) {
    throw new Error("Laptop not found");
  }

  if (redisClient && redisClient.isOpen) {
    await redisClient.setEx(cacheKey, 60, JSON.stringify(singleLaptop));
  }

  return singleLaptop;
};

// =============================
// 🔹 DELETE Laptop Model
// =============================
const removeLaptopModel = async (laptopId) => {
  const redisClient = getRedisClient();

  await LaptopAsset.deleteMany({ laptopModelId: laptopId });

  const deleted = await LaptopModel.deleteOne({ _id: laptopId });

  if (deleted.deletedCount === 0) {
    throw new Error("Laptop not found");
  }

  if (redisClient && redisClient.isOpen) {
    await redisClient.del("dashboard:data");
    await clearLaptopModelCache();
  }

  return deleted;
};

// =============================
// 🔹 UPDATE Laptop Model
// =============================
const modifyLaptopModel = async (laptopId, data) => {
  const redisClient = getRedisClient();

  const oldModel = await LaptopModel.findById(laptopId);

  if (!oldModel) {
    throw new Error("Laptop not found");
  }

  const oldTotal = oldModel.totalAssets || 0;
  const newTotal = parseInt(data.totalAssets) || 0;

  if (newTotal < oldTotal) {
    throw new Error("Cannot reduce total assets");
  }

  const updated = await LaptopModel.findByIdAndUpdate(laptopId, data, {
    new: true,
    runValidators: true,
  });

  if (newTotal > oldTotal) {
    const additional = newTotal - oldTotal;

    const assets = [];
    const brandPrefix = updated.brand.substring(0, 3).toUpperCase();
    const modelPrefix = updated.modelName.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);

    for (let i = 1; i <= additional; i++) {
      assets.push({
        laptopModelId: updated._id,
        serialNumber: `${brandPrefix}-${modelPrefix}-${timestamp}-${String(oldTotal + i).padStart(3, "0")}`,
        status: "Available",
        condition: "Good",
        modelName: updated.modelName,
      });
    }

    await LaptopAsset.insertMany(assets);

    updated.avaliable += additional;
    await updated.save();
  }

  if (redisClient && redisClient.isOpen) {
    await redisClient.del("dashboard:data");
    await clearLaptopModelCache();
  }

  return updated;
};

module.exports = {
  createLaptopModel,
  getLaptopModel,
  getOneLaptopModel,
  removeLaptopModel,
  modifyLaptopModel,
};