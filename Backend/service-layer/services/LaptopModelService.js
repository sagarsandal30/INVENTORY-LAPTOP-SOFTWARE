const LaptopModel = require("../models/LaptopModel");
const LaptopAsset = require("../models/Laptop");
const mongoose = require("mongoose");
const { redisClient } = require("../../Config/redisClient");

// Clear all Laptop Model list cache keys
const clearLaptopModelCache = async () => {
  const keys = await redisClient.keys("laptopModel:list:*");

  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};


// CREATE a new Laptop
const createLaptopModel = async (laptopData) => {
  const existingLaptop = await LaptopModel.findOne({ modelName: laptopData.modelName });
  if (existingLaptop) {
    throw new Error("A laptop model with this name already exists in the inventory.");
  }

  // Set initial stats based on totalAssets
  const totalAssets = parseInt(laptopData.totalAssets) || 0;
  laptopData.avaliable = totalAssets;
  laptopData.inUse = 0;
  laptopData.underRepair = 0;
  laptopData.retired = 0;

  const laptop = new LaptopModel(laptopData);
  await laptop.save();

  // Automatically generate physical assets
  if (totalAssets > 0) {
    const assets = [];
    const brandPrefix = laptop.brand.substring(0, 3).toUpperCase();
    const modelPrefix = laptop.modelName.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);

    for (let i = 1; i <= totalAssets; i++) {
      assets.push({
        laptopModelId: laptop._id,
        serialNumber: `${brandPrefix}-${modelPrefix}-${timestamp}-${String(i).padStart(3, '0')}`,
        status: "Available",
        condition: "Good",
        modelName: laptop.modelName
      });
    }
    await LaptopAsset.insertMany(assets);
  }

  await redisClient.del("Dashboard:data");
  await clearLaptopModelCache();

  return laptop;
}
// Read laptops
const getLaptopModel=async(page,limit,search)=>{
    const skip = (page - 1) * limit;

    const filter={};
    if(search && search.trim() !== ""){
        filter.$or=[
            {modelName: { $regex: search, $options: "i" }},
            {brand: { $regex: search, $options: "i" }},
        ]
    }
    const cacheKey = `laptopModel:list:page=${page}:limit=${limit}:search=${search}`;
      const cachedData = await redisClient.get(cacheKey);
       if(!cachedData){
        console.log("Laptop Model list from MongoDB");
       }
        if (cachedData) {
        console.log("Laptop Model list from Redis");
        return JSON.parse(cachedData);
      }

    const totalModels = await LaptopModel.countDocuments();
    const  allLaptopModels=await LaptopModel.find();
    const existingLaptop=await LaptopModel.find(filter).sort({createdAt:-1}).skip(skip).limit(limit);
    
    if(!existingLaptop){
        throw new Error("No laptops found in the inventory.");
    }
     const totalPages=Math.ceil(totalModels/limit);

      const stats=await LaptopModel.aggregate([
        
        {
            $group: {
                _id: null,
                totalAssets: { $sum: "$totalAssets" },
                totalAvailable: { $sum: "$avaliable" },
                totalInUse: { $sum: "$inUse" },
                totalUnderRepair:{$sum:"$underRepair"}

            }
        }
      ]);
    
    const result= {
        allLaptopModels,
        existingLaptop,
        stats:{
            totalModels:totalModels,
            totalAssets:stats[0]?.totalAssets,
            totalAvailable:stats[0]?.totalAvailable,
    totalInUse:stats[0]?.totalInUse,
    totalUnderRepair:stats[0]?.totalUnderRepair
        },
        totalPages,
currentPage:page
            

};
await redisClient.setEx(cacheKey,60,JSON.stringify(result));
return result;
        }


// READ a single Laptop by its specific MongoDB ID
const getOneLaptopModel=async(laptopId)=>{

    const cacheKey = `laptopModel:${laptopId}`;
        const cachedLaptopModel = await redisClient.get(cacheKey);
    if (cachedLaptopModel) {
        console.log("Single laptop Model from Redis");
        return JSON.parse(cachedLaptopModel);
      }

    const singleLaptop=await LaptopModel.findOne({_id:laptopId});
    if(!singleLaptop){
        throw new Error("No  specific laptop found in the inventory.");
    }
await redisClient.setEx(cacheKey,60,JSON.stringify(singleLaptop));

    return singleLaptop;
       
    }

const removeLaptopModel = async (laptopId) => {
  // 1. Delete all associated physical assets first
  await LaptopAsset.deleteMany({ laptopModelId: laptopId });

  // 2. Delete the model
  const deleteLaptop = await LaptopModel.deleteOne({ _id: laptopId });
  
  await redisClient.del("Dashboard:data");
  await clearLaptopModelCache();

  if (deleteLaptop.deletedCount === 0) {
    throw new Error("No laptop model found for delete");
  }
  return deleteLaptop;
}


const modifyLaptopModel = async (laptopId, data) => {
  const oldModel = await LaptopModel.findById(laptopId);
  if (!oldModel) {
    throw new Error("No laptop model found for update");
  }

  const oldTotal = oldModel.totalAssets || 0;
  const newTotal = parseInt(data.totalAssets) || 0;

  // Prevent reducing total assets manually if assets already exist
  if (newTotal < oldTotal) {
    throw new Error(`Cannot reduce total assets below current count (${oldTotal}). Please delete individual physical assets instead.`);
  }

  // Update the model
  const updatedLaptopModel = await LaptopModel.findByIdAndUpdate(laptopId, data, {
    new: true,
    runValidators: true
  });

  // If totalAssets increased, generate additional physical assets
  if (newTotal > oldTotal) {
    const additionalCount = newTotal - oldTotal;
    const assets = [];
    const brandPrefix = updatedLaptopModel.brand.substring(0, 3).toUpperCase();
    const modelPrefix = updatedLaptopModel.modelName.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);

    for (let i = 1; i <= additionalCount; i++) {
      assets.push({
        laptopModelId: updatedLaptopModel._id,
        serialNumber: `${brandPrefix}-${modelPrefix}-${timestamp}-${String(oldTotal + i).padStart(3, '0')}`,
        status: "Available",
        condition: "Good",
        modelName: updatedLaptopModel.modelName
      });
    }
    await LaptopAsset.insertMany(assets);

    // Update the available count to reflect new assets
    updatedLaptopModel.avaliable = (updatedLaptopModel.avaliable || 0) + additionalCount;
    await updatedLaptopModel.save();
  }

  await redisClient.del("Dashboard:data");
  await clearLaptopModelCache();

  return updatedLaptopModel;
}

module.exports={createLaptopModel,getLaptopModel,getOneLaptopModel,removeLaptopModel,modifyLaptopModel};