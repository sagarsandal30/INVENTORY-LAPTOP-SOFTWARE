const LaptopAsset = require("../models/Laptop");


// CREATE a new Laptop Asset
const createLaptop = async (laptopData) => {
     const existingLaptop = await LaptopAsset.findOne({serialNumber: laptopData.serialNumber});
  if (existingLaptop) {
    // If it exists, throw an error. The Controller will catch this and send a 400 Bad Request
    throw new Error("A laptop  with this already  exists in the inventory.");
  }
    const laptop=new LaptopAsset(laptopData);

    await laptop.save();

    return laptop;

}
// Read laptops
const getLaptop = async (page, limit, modelId,search,statusFilter,conditionFilter) => {
  console.log("inside service");

  const skip = (page - 1)*limit;

  const filter={};

  if(search&&search.trim()!==""){
    filter.$or=[
      {serialNumber:{$regex:search,$options:"i"}},
    ]
  }

  if(statusFilter&&statusFilter!=="All"){
    filter.status=statusFilter;
  }
  if(conditionFilter&&conditionFilter!=="All"){
    filter.condition=conditionFilter;
  }

 const allLaptopAssets=await LaptopAsset.find();

  const existingLaptopAssets = await LaptopAsset.find({...filter, laptopModelId: modelId })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit);

  if (!existingLaptopAssets) {
    throw new Error("No laptops found in the inventory.");
  }

  const totalAssets = await LaptopAsset.countDocuments({ laptopModelId: modelId });
  const totalPages = Math.ceil(totalAssets / limit);

  const modelName = existingLaptopAssets[0]?.laptopModelId?.modelName || "";

  return {
    allLaptopAssets,
    existingLaptopAssets,
    modelName,
    totalPages,
  };
};
// READ a single Laptop by its specific MongoDB ID
const getOneLaptop=async(laptopId)=>{
    const singleLaptop=await LaptopAsset.findOne({_id:laptopId});
    if(!singleLaptop){
        throw new Error("No  specific laptop found in the inventory.");
    }
    return singleLaptop;   
}

const removeLaptop=async(laptopId)=>{
    const deleteLaptop=await LaptopAsset.deleteOne({_id:laptopId});
    if(deleteLaptop.deletedCount === 0){
        throw new Error("No laptop found for delete");
    }
    return deleteLaptop;
}
const modifyLaptop=async(laptopId,data)=>{
    const updated=await LaptopAsset.findByIdAndUpdate(laptopId,data ,{
      new: true,
      runValidators: true
    });
    if(!updated){
        throw new Error("No laptop found for update");
    }
    return updated;
}

module.exports={
  createLaptop,
  getLaptop,
  getOneLaptop,
  removeLaptop,
  modifyLaptop,
} ;