// const {createSoftware,getSoftware,getOneSoftware,removeSoftware,modifySoftware} = require("../../service-layer/services/SoftwareService");

const {createSoftware,getSoftware,getOneSoftware,removeSoftware,modifySoftware} = require("../../service-layer/services/SoftwareService");

const addSoftware=async(req,res,next)=>{
try{
     const newSoftware = await createSoftware(req.body);
     res.status(201).json({
      success: true,
      message: "Software created successfully",
       newSoftware
    });
}
catch(error){
    res.status(400).json({ 
        success: false, 
        message: error.message });
}
}

const getAllSoftware=async(req,res,next)=>{
try{
    const {page,limit,search,catFilter}=req.query
     const softwares = await getSoftware(page,limit,search,catFilter);
      res.status(200).json({
      success: true,
      message: "Software fetched successfully",
      ...softwares
    });
}
catch(error){
    res.status(400).json({ 
        success: false,
         message: error.message });
}

}

const getSoftwareById=async(req,res,next)=>{
try{
    const softwareId = req.params.id;
     const singleSoftware = await getOneSoftware(softwareId);
      res.status(200).json({
      success: true,
      message: "Software fetched successfully",
      software: singleSoftware
    });
}
catch(error){
    res.status(400).json({ 
        success: false, 
        message: error.message });
}

}
const deleteSoftware=async(req,res,next)=>{
try{
    const softwareId = req.params.id;
     const singleSoftwareDelete = await removeSoftware(softwareId);
     res.status(200).json({
      success: true,
      message: " Software deleted successfully",
      software: singleSoftwareDelete
    });
}
catch(error){
    res.status(400).json({ 
        success: false,
         message: error.message });
}
}
const updateSoftware=async(req,res,next)=>{
try{
    const softwareId = req.params.id;
     const updateSoftware = await modifySoftware(softwareId,req.body);
     res.status(200).json({
      success: true,
      message: "Software updated successfully",
      updateSoftware
    });
}
catch(error){
    res.status(400).json({ 
        success: false, 
        message: error.message
     });
}
}

module.exports={addSoftware,getAllSoftware,getSoftwareById,deleteSoftware,updateSoftware};
