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
    // If it exists, throw an error. The Controller will catch this and send a 400 Bad Request
    throw new Error("A laptop model with this name already  exists in the inventory.");
  }
    const laptop=new LaptopModel(laptopData);
    await redisClient.del("Dashboard:data");
    await clearLaptopModelCache();
    await laptop.save();

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
    totalUnderRepair:stats[0]?.totolUnderRepair
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

const removeLaptopModel=async(laptopId)=>{
    const deleteLaptop=await LaptopModel.deleteOne({_id:laptopId});
    await redisClient.del("Dashboard:data");
    await clearLaptopModelCache();
    if(deleteLaptop.deletedCount === 0){
        throw new Error("No laptop found for delete");
    }
    return deleteLaptop;
}


const modifyLaptopModel=async(laptopId,data)=>{
    const updatedLaptopModel=await LaptopModel.findByIdAndUpdate(laptopId,data ,{
      new: true,
      runValidators: true
    });
        await redisClient.del("Dashboard:data");
    await clearLaptopModelCache();
    if(!updatedLaptopModel){
        throw new Error("No laptop found for update");
    }
    return updatedLaptopModel;
}

module.exports={createLaptopModel,getLaptopModel,getOneLaptopModel,removeLaptopModel,modifyLaptopModel};