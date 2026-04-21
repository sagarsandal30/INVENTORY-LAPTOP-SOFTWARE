const express=require("express");

const employeeRouter = express.Router();
const authMiddleware = require("../middlewares/AuthMiddleware");
const {
  createEmployees,
  fetchAllEmployees,
  singleEmployee,
  employeeUpdate,
  employeeDelete,

} = require("../controllers/EmployeeController");
const allowRoles = require("../middlewares/AllowRoles");

employeeRouter.use(authMiddleware);


employeeRouter.post("/",allowRoles("Admin"),createEmployees);
employeeRouter.get("/",allowRoles("Admin","Manager"),  fetchAllEmployees);
employeeRouter.get("/:id", allowRoles("Admin"),singleEmployee);
employeeRouter.put("/:id",allowRoles("Admin"), employeeUpdate);
employeeRouter.delete("/:id",allowRoles("Admin"),employeeDelete);

module.exports=employeeRouter;