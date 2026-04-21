const {createEmployee,getAllEmployee,getOneEmployee,updateEmployee,deleteEmployee} = require("../../service-layer/services/EmployeeService");


const createEmployees= async(req,res)=>{
    try{
  const employee=  await createEmployee(req.body);
    res.status(201).json({
        success:true,
        message:"Employee created successfully",
        employee:employee
    })
}
catch(error){
    res.status(400).json({
        success:false,
        message:error.message
    })
}

}

// GET All Employees
const fetchAllEmployees = async (req, res) => {
  try {
     const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const search=req.query.search||" ";
    const status=req.query.status|| "All";
    if(search){
      
    }
    const data = await getAllEmployee(page,limit,search,status);

    res.status(200).json({
      success: true,
      message: "Employees fetched successfully",
         ...data  ,
          });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// GET One Employee
const singleEmployee = async (req, res) => {
  try {
    const employee = await getOneEmployee(req.params.id);

    res.status(200).json({
      success: true,
      message: "Employee fetched successfully",
      employee
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE Employee
const employeeUpdate = async (req, res) => {
  try {
    const updatedEmployee = await updateEmployee(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      employee: updatedEmployee
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE Employee
const employeeDelete = async (req, res) => {
  try {
    //  console.log("Controller req.params:", req.params);
    //  console.log("Controller ID:", req.params.id);

    await deleteEmployee(req.params.id);

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully"
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  createEmployees,
  fetchAllEmployees,
  singleEmployee,
  employeeUpdate,
  employeeDelete,
  
};