const User = require("../models/User");
const {redisClient} =require("../../Config/redisClient")


//Get Data of user in profile section.
const getProfileService = async (userId) => {
const cacheKey = `setting:${userId}`;

  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    console.log("Setting data from Redis");
    return JSON.parse(cachedData);
  }
  console.log("Setting data from MongoDB");


  const user = await User.findById(userId).select("-password ");

  if (!user) {
    throw new Error("User not found");
  }
  await redisClient.setEx(cacheKey,60, JSON.stringify(user));

  return user;
};

//Update Profile of User
const updateProfileService = async (userId, profileData) => {
 const cacheKey = `setting:${userId}`;

  const user = await User.findByIdAndUpdate(userId, profileData, {
  returnDocument: "after",
  runValidators: true,
}).select("-password ");
  await redisClient.del(cacheKey);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

const updatePasswordService = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new Error("Incorrect current password");
  }

  user.password = newPassword;
  await user.save();

  return true;
};

module.exports = {
  getProfileService,
  updateProfileService,
  updatePasswordService,
};