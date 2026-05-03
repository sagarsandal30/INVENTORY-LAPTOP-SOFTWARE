const express=require("express");

const assignmentRouter = express.Router();

const authMiddleware = require("../middlewares/AuthMiddleware");
// const {createAssignment,getAllAssignments,getAssignmentsById,updateAssignment,returnAssignment,deleteAssignment} = require("../controllers/AssignmentController");
 const {createAssignment,getAllAssignments,getAssignmentsById,returnAssignment,  getAvaliableEmployees}= require("../controllers/AssignmentController");
const allowRoles = require("../middlewares/AllowRoles");

assignmentRouter.use(authMiddleware);

assignmentRouter.post("/assignment",allowRoles("Admin","IT Operations"),createAssignment);
assignmentRouter.get("/getAllAssignments",allowRoles("Admin","IT Operations"), getAllAssignments);
assignmentRouter.get("/getAvaliableEmployees",allowRoles("Admin","IT Operations"),  getAvaliableEmployees);

assignmentRouter.get("/getSingleAssignment/:id",allowRoles("Admin","IT Operations"), getAssignmentsById);
assignmentRouter.patch("/returnAssignments/:id",allowRoles("Admin", "IT Operations"),returnAssignment);
assignmentRouter.delete("/deleteAssignment/:id", allowRoles("Admin", "IT Operations"), deleteAssignment);


module.exports=assignmentRouter;