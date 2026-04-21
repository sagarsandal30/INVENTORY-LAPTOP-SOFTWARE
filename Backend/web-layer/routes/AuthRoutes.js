const express = require("express");

const router = express.Router();
const authMiddleware = require("../middlewares/AuthMiddleware");

const {login,register} = require("../controllers/AuthController")



router.post("/register", register);
router.post("/login", login);


module.exports = router;