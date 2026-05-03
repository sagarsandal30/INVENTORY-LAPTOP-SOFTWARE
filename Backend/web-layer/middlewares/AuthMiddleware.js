const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const tokenHeader = req.headers.authorization;
  
  if (!tokenHeader || !tokenHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "No token provided or invalid format",
    });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("❌ JWT_SECRET is not defined in environment variables");
    return res.status(500).json({
      success: false,
      message: "Internal server configuration error",
    });
  }

  try {
    const token = tokenHeader.split(" ")[1];
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    console.log("🔓 User Authenticated:", req.user.role, req.user.email);
    next();
  } catch (error) {
    console.error("🔐 Auth Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};


module.exports = authMiddleware;