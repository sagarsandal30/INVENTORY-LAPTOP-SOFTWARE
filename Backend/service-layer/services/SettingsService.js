const User = require("../models/User");
const { getRedisClient } = require("../../Config/redisClient");

// Get Data of user in profile section
const getProfileService = async (userId) => {
  const redisClient = getRedisClient();
  const cacheKey = `setting:${userId}`;

  let cachedData = null;

  if (redisClient && redisClient.isOpen) {
    cachedData = await redisClient.get(cacheKey);
  }

  if (cachedData) {
    console.log("Setting data from Redis");
    return JSON.parse(cachedData);
  }

  console.log("Setting data from MongoDB");

  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  if (redisClient && redisClient.isOpen) {
    await redisClient.setEx(cacheKey, 60, JSON.stringify(user));
  }

  return user;
};

// Update Profile of User
const updateProfileService = async (userId, profileData) => {
  const redisClient = getRedisClient();
  const cacheKey = `setting:${userId}`;

  const user = await User.findByIdAndUpdate(userId, profileData, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  if (redisClient && redisClient.isOpen) {
    await redisClient.del(cacheKey);
  }

  return user;
};

const updatePasswordService = async (userId, currentPassword, newPassword) => {
  const redisClient = getRedisClient();
  const cacheKey = `setting:${userId}`;

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

  if (redisClient && redisClient.isOpen) {
    await redisClient.del(cacheKey);
  }

  return true;
};

module.exports = {
  getProfileService,
  updateProfileService,
  updatePasswordService,
};