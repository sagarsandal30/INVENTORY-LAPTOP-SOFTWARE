const express=require("express");
const laptopRouter = express.Router();
const authMiddleware = require("../middlewares/AuthMiddleware");
const {addLaptop , getAllLaptops,getLaptopByID,deleteLaptop,updateLaptop}=require("../controllers/LaptopController")
const allowRoles = require("../middlewares/AllowRoles");
laptopRouter.use(authMiddleware);

laptopRouter.post("/", allowRoles("Admin", "IT Operations"),addLaptop);
laptopRouter.get("/",allowRoles("Admin","IT Operations"),getAllLaptops);
laptopRouter.get("/:id",allowRoles("Admin","IT Operations"),getLaptopByID);
laptopRouter.delete("/:id", allowRoles("Admin","IT Operations"),deleteLaptop);
laptopRouter.put("/:id", allowRoles("Admin", "IT Operations"),updateLaptop);

module.exports=laptopRouter;