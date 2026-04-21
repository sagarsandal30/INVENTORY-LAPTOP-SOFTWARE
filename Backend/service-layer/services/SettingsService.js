const User = require("../models/User");

const getProfileService = async (userId) => {
  const user = await User.findById(userId).select("-password -confirmPassword");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

const updateProfileService = async (userId, profileData) => {

  const user = await User.findByIdAndUpdate(
    userId,
    profileData,
    { new: true, runValidators: true }
  ).select("-password -confirmPassword");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};



module.exports = {
  getProfileService,
  updateProfileService,

};