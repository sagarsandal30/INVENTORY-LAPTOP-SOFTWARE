const Software = require("../models/Software");
const IndividualSoftware = require("../models/IndividualSoftware");
const { getRedisClient } = require("../../Config/redisClient");

// =============================
// 🔹 Clear Cache
// =============================
const clearSoftwareCache = async () => {
  const redisClient = getRedisClient();

  if (redisClient && redisClient.isOpen) {
    const keys = [];

    for await (const key of redisClient.scanIterator({
      MATCH: "software:list:*",
      COUNT: 100,
    })) {
      keys.push(key);
    }

    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  }
};

// =============================
// 🔹 CREATE Software
// =============================
const createSoftware = async (softwareData) => {
  const redisClient = getRedisClient();

  const totalLicenses = parseInt(softwareData.totalLicenses) || 0;
  softwareData.usedLicenses = 0;

  const software = new Software(softwareData);
  await software.save();

  if (totalLicenses > 0) {
    const licenses = [];
    const vendorPrefix = (software.vendor || "UNK").substring(0, 3).toUpperCase();
    const softwarePrefix = (software.softwareName || "SW").substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);

    for (let i = 1; i <= totalLicenses; i++) {
      licenses.push({
        softwareModelId: software._id,
        licenseKey: `${vendorPrefix}-${softwarePrefix}-KEY-${timestamp}-${String(i).padStart(3, '0')}`,
        status: "Available",
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        renewalStatus: "Active"
      });
    }

    await IndividualSoftware.insertMany(licenses);
  }

  if (redisClient && redisClient.isOpen) {
    await redisClient.del("dashboard:data");
    await clearSoftwareCache();
  }

  return software;
};

// =============================
// 🔹 GET Software
// =============================
const getSoftware = async (page, limit, search, catFilter) => {
  const redisClient = getRedisClient();
  const skip = (page - 1) * limit;

  const filter = {};

  if (search && search.trim() !== "") {
    filter.$or = [
      { softwareName: { $regex: search, $options: "i" } },
      { vendor: { $regex: search, $options: "i" } }
    ];
  }

  if (catFilter && catFilter !== "All") {
    filter.category = catFilter;
  }

  const cacheKey = `software:list:page=${page}:limit=${limit}:search=${search}:catFilter=${catFilter}`;

  // 🔥 CACHE READ
  if (redisClient && redisClient.isOpen) {
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log("⚡ Software from Redis");
      return JSON.parse(cachedData);
    }
  }

  console.log("🧠 Software from MongoDB");

  const allSoftware = await Software.find();
  const existingSoftware = await Software.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalSoftware = await Software.countDocuments();

  const activeLicenses = await Software.countDocuments({
    expiryDate: { $gt: new Date() }
  });

  const critical = await Software.countDocuments({
    expiryDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
  });

  const stats = await Software.aggregate([
    {
      $group: {
        _id: null,
        totalLicenses: { $sum: "$totalLicenses" },
        usedLicenses: { $sum: "$usedLicenses" },
      }
    }
  ]);

  const result = {
    existingSoftware,
    allSoftware,
    totalPages: Math.ceil(totalSoftware / limit),
    currentPage: page,
    stats: {
      totalSoftwares: totalSoftware,
      activeLicenses,
      totalLicenses: stats[0]?.totalLicenses || 0,
      usedLicenses: stats[0]?.usedLicenses || 0,
      critical,
    }
  };

  // 🔥 CACHE SAVE
  if (redisClient && redisClient.isOpen) {
    await redisClient.setEx(cacheKey, 60, JSON.stringify(result));
  }

  return result;
};

// =============================
// 🔹 DELETE Software
// =============================
const removeSoftware = async (softwareId) => {
  const redisClient = getRedisClient();

  await IndividualSoftware.deleteMany({ softwareModelId: softwareId });

  const deleteSoftware = await Software.deleteOne({ _id: softwareId });

  if (deleteSoftware.deletedCount === 0) {
    throw new Error("No software found");
  }

  if (redisClient && redisClient.isOpen) {
    await redisClient.del("dashboard:data");
    await redisClient.del(`software:${softwareId}`);
    await clearSoftwareCache();
  }

  return deleteSoftware;
};

// =============================
module.exports = {
  createSoftware,
  getSoftware,
  getOneSoftware: async (id) => Software.findById(id),
  removeSoftware,
  modifySoftware: async (id, data) =>
    Software.findByIdAndUpdate(id, data, { new: true })
};