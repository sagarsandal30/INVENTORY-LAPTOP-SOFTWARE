const User = require("../models/User");
const EmployeeService = require("./EmployeeService"); // Added
const jwt = require("jsonwebtoken");

//Register User
const registerUser = async (userData) => {
  const userExists = await User.findOne({ email: userData.email });
  if (userExists) {
    throw new Error("User with this email already exists");
  }
  const {password,confirmPassword}=userData;

  if(password && !confirmPassword){
    throw new Error("Confirm password is Required");
  }
  if(password !== confirmPassword){
    throw new Error("Password and Confirm Password do not match");
  }
  
  if(!password ||!confirmPassword){
    throw new Error("Password and Confirm Password are required");
  }

  const user = new User(userData);
  await user.save();

  // Automatically create Employee record
  try {
    await EmployeeService.createEmployee({
      userId: user._id,
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phoneNumber: user.phone || "",
      department: user.department,
      role: user.role || "Employee",
      joinDate: new Date(),
      status: "Active",
      location: "Not Assigned"
    });
  } catch (employeeError) {
    console.error("Auto-employee creation failed:", employeeError.message);
    // We don't throw error here to not block user registration if employee creation fails
  }

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.confirmPassword;
  
  return userObj;
};

//Login User 
const loginUser = async (loginData) => {

  const user = await User.findOne({
  email: loginData.email,
 
});
  if (!user) {
    throw new Error("Invalid credentials");
  }
  const isMatch = await user.comparePassword(loginData.password);
  if (!isMatch) {
    throw new Error("Invalid Password");
  }
 //Check role separately
if (user.role !== loginData.role) {
  throw new Error("Invalid role");
}
  

  const payload = {
    id: user._id,
    role: user.role,
    username: user.firstName,
    email: user.email,

  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.confirmPassword;

 
  return { user: userObj, token };
};


module.exports = {registerUser, loginUser};
