const showDashboardData=require("../../service-layer/services/DashboardService") 
 
 
const fetchDashboardData=async(req,res)=>{
    try{
  const  data= await showDashboardData();
  res.status(200).json({
    success:true,
    message:"Dashboard data fetched successfully",
    ...data
  })

    }catch(error){
        console.error("Error fetching dashboard data:", error);
    }
}
module.exports =fetchDashboardData