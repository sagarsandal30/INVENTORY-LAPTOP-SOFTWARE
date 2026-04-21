const allowRoles = (...roles) => {
  return (req, res, next) => {
      const role = req.user.role;

    if (!req.user || !roles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied  ",
        role: role,
      });
    }
    next();
  };
};

module.exports = allowRoles;
