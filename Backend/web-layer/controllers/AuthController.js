const {loginUser, registerUser} = require("../../service-layer/services/AuthService");

const register = async (req, res, next) => {
  try {
  
    const user = await registerUser(req.body);
    
    res.status(201).json({ 
      success: true, 
      registeredUser:user 
    });
  } catch (error) {
    // If anything fails (like a duplicate email), return a 400 Bad Request
    res.status(400).json({
       success: false, 
       message: error.message });
  }
};

/**
 * Controller to handle User Login
 * Entry point for POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    // Call the loginUser method, which returns the user object and a JWT token
    const { user, token } = await loginUser(req.body);
    
    // Send a 200 OK status, the user object, and the token to the frontend
    res.status(200).json({
       success: true,
        user,
         token 
      });
  } catch (error) {
    // Send error if credentials do not match
    res.status(400).json({ success: false, message: error.message });
  }
};

// Export controllers to attach them to routes
module.exports = { register, login };