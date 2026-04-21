const express=require("express");
const laptopModelRouter = express.Router();
const authMiddleware = require("../middlewares/AuthMiddleware");
const allowRoles = require("../middlewares/AllowRoles");

const {addLaptopModels , getAllLaptopsModels,getLaptopModelById,deleteLaptopModel,updateLaptopModel}=require("../controllers/LaptopModelController")

laptopModelRouter.use(authMiddleware);

laptopModelRouter.post("/", allowRoles("Admin", "IT Operations"),addLaptopModels);
laptopModelRouter.get("/",allowRoles("Admin","IT Operations"),getAllLaptopsModels);
laptopModelRouter.get("/:id",allowRoles("Admin","IT Operations"),getLaptopModelById);
laptopModelRouter.delete("/:id", allowRoles("Admin","IT Operations"),deleteLaptopModel);
laptopModelRouter.put("/:id", allowRoles("Admin", "IT Operations"),updateLaptopModel);

module.exports=laptopModelRouter;