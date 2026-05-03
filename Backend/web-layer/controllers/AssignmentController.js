const {create,fetch,fetchById,assignmentReturn,avaliableEmployee,remove} = require("../../service-layer/services/AssignmentService");


const createAssignment=async (req,res)=>{
    try {
        const data = await create(req.body);
        res.status(201).json({
            success:true,
            message:"Laptop assigned successfully",
        data
        });
        }
        catch(error){
            res.status(400).json({
                success:false,
                message:error.message
            });
        }
}
const getAllAssignments=async(req,res)=>{
    try{
        const {page,limit,search,assetType,assetStatus} = req.query;
        const data = await fetch(page,limit,search,assetType,assetStatus);
        res.status(200).json({
            success:true,
            message:"All assignments fetched successfully",
            ...data,
        }); 
        
    }
    catch(error){
        console.log("catch eror",error)
        res.status(400).json({
            success:false,
            message:error.message
        });
    }

}
const getAssignmentsById= async (req,res)=>{
    try{
            const id = req.params.id;
            const data =  await fetchById(id);
            if(data){
                res.status(200).json({
                    success:true,
                    message:"Assignment fetched successfully",
                    data
                });
            }

    }
    catch(error){
        res.status(400).json({
            success:false,
            message:error.message
        }); 
    }
}

const returnAssignment=async(req,res)=>{
    try{
    const id = req.params.id;
 const data=await assignmentReturn(id);
 res.status(200).json({
    success:true,
    message:"Assignment Returned Successfully",
    data,
 })
}
catch(error){
 res.status(400).json({
    success:false,
 message:error.message
 });
    }
}

// GET All  Avaliable Employees
const getAvaliableEmployees = async (req, res) => {
  try {
    
    const data = await avaliableEmployee();
    res.status(200).json({
      success: true,
      message: " Avaliable Employees fetched successfully",
         data  ,
          });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await remove(id);
    res.status(200).json({
      success: true,
      message: "Assignment deleted successfully",
      data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports= {createAssignment,getAllAssignments,getAssignmentsById,returnAssignment,getAvaliableEmployees,deleteAssignment}