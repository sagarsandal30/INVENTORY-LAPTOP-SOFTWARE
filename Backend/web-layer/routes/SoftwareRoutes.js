const express=require("express");
const softwareRouter = express.Router();
const authMiddleware = require("../middlewares/AuthMiddleware");
const {addSoftware , getAllSoftware,getSoftwareById,deleteSoftware,updateSoftware}=require("../controllers/SoftwareController")
const allowRoles = require("../middlewares/AllowRoles");

softwareRouter.use(authMiddleware);

softwareRouter.post("/", allowRoles("Admin", "IT Operations"),addSoftware);
softwareRouter.get("/",allowRoles("Admin","IT Operations"),getAllSoftware);
softwareRouter.get("/:id", allowRoles("Admin","IT Operations"),getSoftwareById);
softwareRouter.delete("/:id", allowRoles("Admin","IT Operations"),deleteSoftware);
softwareRouter.put("/:id", allowRoles("Admin", "IT Operations"),updateSoftware);

module.exports=softwareRouter;