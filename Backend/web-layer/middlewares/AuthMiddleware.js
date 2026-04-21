const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const tokenHeader = req.headers.authorization;
  if (!tokenHeader || !tokenHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "No token provided or invalid format",
    });
  }
  try {
    const token=tokenHeader?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log(req.user);
    const createdAt = new Date(decoded.iat * 1000);
    next();
  } catch (error) {
    // If verification fails (expired or fake token)
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
  
};


module.exports = authMiddleware;