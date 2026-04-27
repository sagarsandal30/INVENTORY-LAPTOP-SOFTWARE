const Software = require("../models/IndividualSoftware");



// CREATE a new Software
const createSoftware = async (softwareData) => {
    
    const software=new Software(softwareData);

    await software.save();
    return software;

}
// Read Software
const getSoftware = async (page,limit,search,catFilter) => {
    const skip=(page-1)*limit;

    const filter={}
    
    if(search&&search.trim()!==""){
        filter.$or=[
            {softwareName:{$regex:search,$options:"i"}},
            {vendor:{$regex:search,$options:"i"}}
        ]
    }

    if(catFilter&&catFilter!=="All"){
        filter.category=catFilter;
    }
    const allSoftware=await Software.find();
    const existingSoftware = await  Software.find(filter).sort({createdAt:-1}).skip(skip).limit(limit);
    if (!existingSoftware) {
        throw new Error("No Software found in the inventory.");
    }
    const totalSoftware=await Software.countDocuments();
    const activeLicenses = await Software.countDocuments({
  expiryDate: { $gt: new Date() }
});
//Critical / Expired
const today = new Date();

const critical = await Software.countDocuments({
  expiryDate: { $lte: new Date(today.getTime() + 30*24*60*60*1000) }
});
//Upcoming Renewals
// const upcoming = await Software.countDocuments({
//   expiryDate: {
//     $gt: new Date(Date.now() + 30*24*60*60*1000),
//     $lte: new Date(Date.now() + 90*24*60*60*1000)
//   }
// });

    const totalPages=Math.ceil(totalSoftware/limit);

    const stats=await Software.aggregate(
        [
            {
                $group:{
                    _id:null,
                    totalLicenses:{$sum:"$totalLicenses"},
                    usedLicenses:{$sum:"$usedLicenses"},
                }
            }
        ]
    )

    console.log(stats[0]?.usedLicenses);
    console.log(stats[0]?.totalLicenses);

    return {existingSoftware,
        allSoftware,
        totalPages,
        currentPage:page,
    stats:{
        totalSoftwares:totalSoftware,
        activeLicenses:activeLicenses,
        totalLicenses:stats[0]?.totalLicenses,
        usedLicenses:stats[0]?.usedLicenses,
        critical:critical,
        upcoming:upcoming
    }};
}

// READ a single SoftwareModel by its specific MongoDB ID
const getOneSoftware=async(softwareId)=>{
    const singleSoftware=await Software.findById(softwareId);
    if(singleSoftware==null){
        throw new Error("No  specific software found in the inventory.");
    }
    return singleSoftware;   
}

// Delete Software
const removeSoftware=async(softwareId)=>{
    const deleteSoftware=await Software.deleteOne({_id:softwareId});
    if(deleteSoftware.deletedCount === 0){
        throw new Error("No software found for delete");
    }
    return deleteSoftware;
}
// Update software
const modifySoftware=async(softwareId,data)=>{
    const updated=await Software.findByIdAndUpdate(softwareId,data ,{
      new: true,
      runValidators: true
    });
    if(!updated){
        throw new Error("No software found for update");
    }
    return updated;
}

// module.exports={createSoftware,getSoftware,getOneSoftware,removeSoftware,modifySoftware};
module.exports={createSoftware,getSoftware,getOneSoftware,removeSoftware,modifySoftware};