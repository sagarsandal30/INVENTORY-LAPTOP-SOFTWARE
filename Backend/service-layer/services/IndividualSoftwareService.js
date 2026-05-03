const mongoose = require("mongoose");
const IndividualSoftware = require("../models/IndividualSoftware");
const Notification = require("../models/Notification");
const Software = require("../models/Software");
const { getRedisClient } = require("../../Config/redisClient");

// =============================
// Clear Individual Software Cache
// =============================
const clearIndividualSoftwareCache = async () => {
  const redisClient = getRedisClient();

  if (!redisClient || !redisClient.isOpen) return;

  const keys = [];

  for await (const key of redisClient.scanIterator({
    MATCH: "individualSoftware:list:*",
    COUNT: 100,
  })) {
    keys.push(key);
  }

  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};

const clearCommonCache = async () => {
  const redisClient = getRedisClient();

  if (!redisClient || !redisClient.isOpen) return;

  await redisClient.del("dashboard:data");
  await clearIndividualSoftwareCache();
};

// =============================
// Notification Helper
// =============================
const checkAndNotify = async (license) => {
  if (!license.expiryDate) return;

  const now = new Date();
  const daysLeft = Math.ceil(
    (new Date(license.expiryDate) - now) / (1000 * 60 * 60 * 24)
  );

  let status = "Active";

  if (daysLeft <= 0) status = "Expired";
  else if (daysLeft <= 30) status = "Critical";
  else if (daysLeft <= 90) status = "Expiring Soon";

  if (license.renewalStatus !== status) {
    license.renewalStatus = status;

    if (daysLeft <= 0) {
      license.status = "Expired";
    }

    await license.save();
  }

  if (status !== "Active") {
    const fullLicense = await IndividualSoftware.findById(license._id).populate(
      "softwareModelId"
    );

    const softwareName = fullLicense?.softwareModelId?.softwareName || "Software";

    await Notification.create({
      title: `Software License ${status}`,
      message: `License key ${license.licenseKey} for ${softwareName} is ${status.toLowerCase()}. Expiry: ${new Date(
        license.expiryDate
      ).toLocaleDateString()}`,
      type: status === "Expired" || status === "Critical" ? "Critical" : "Warning",
      category: "Software",
      relatedModel: "Software",
      relatedId: license._id,
      targetRole: "IT Operations",
    });
  }
};

// =============================
// CREATE Software License
// =============================
const createSoftware = async (softwareData) => {
  const software = new IndividualSoftware(softwareData);
  await software.save();

  await checkAndNotify(software);

  await clearCommonCache();

  return software;
};

// =============================
// GET Software Licenses
// =============================
const getSoftware = async (
  page,
  limit,
  search,
  statusFilter,
  softwareModelId
) => {
  const redisClient = getRedisClient();

  const cacheKey = `individualSoftware:list:page=${page}:limit=${limit}:search=${search || ""}:status=${statusFilter || ""}:softwareModelId=${softwareModelId || ""}`;

  if (redisClient && redisClient.isOpen) {
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log("Individual Software from Redis");
      return JSON.parse(cachedData);
    }
  }

  console.log("Individual Software from MongoDB");

  const skip = (page - 1) * limit;
  const filter = {};

  if (softwareModelId) {
    if (mongoose.Types.ObjectId.isValid(softwareModelId)) {
      filter.softwareModelId = new mongoose.Types.ObjectId(softwareModelId);
    } else {
      filter.softwareModelId = softwareModelId;
    }
  }

  if (search && search.trim() !== "") {
    filter.$or = [{ licenseKey: { $regex: search, $options: "i" } }];
  }

  if (statusFilter && statusFilter !== "All") {
    filter.status = statusFilter;
  }

  const totalLicenses = await IndividualSoftware.countDocuments(filter);

  const existingSoftware = await IndividualSoftware.find(filter)
    .populate("softwareModelId")
    .populate("assignedTo")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalLicenses / limit);

  const statFilter = softwareModelId
    ? { softwareModelId: filter.softwareModelId }
    : {};

  const stats = {
    total: await IndividualSoftware.countDocuments(statFilter),
    available: await IndividualSoftware.countDocuments({
      ...statFilter,
      status: "Available",
    }),
    assigned: await IndividualSoftware.countDocuments({
      ...statFilter,
      status: "Assigned",
    }),
    expired: await IndividualSoftware.countDocuments({
      ...statFilter,
      status: "Expired",
    }),
    expiringSoon: await IndividualSoftware.countDocuments({
      ...statFilter,
      expiryDate: {
        $gt: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
  };

  const result = {
    existingSoftware,
    totalPages,
    currentPage: page,
    stats,
  };

  if (redisClient && redisClient.isOpen) {
    await redisClient.setEx(cacheKey, 60, JSON.stringify(result));
  }

  return result;
};

// =============================
// GET ONE Software License
// =============================
const getOneSoftware = async (softwareId) => {
  const redisClient = getRedisClient();
  const cacheKey = `individualSoftware:${softwareId}`;

  if (redisClient && redisClient.isOpen) {
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log("Single Individual Software from Redis");
      return JSON.parse(cachedData);
    }
  }

  const singleSoftware = await IndividualSoftware.findById(softwareId).populate(
    "softwareModelId"
  );

  if (!singleSoftware) {
    throw new Error("No specific license found in the inventory.");
  }

  if (redisClient && redisClient.isOpen) {
    await redisClient.setEx(cacheKey, 60, JSON.stringify(singleSoftware));
  }

  return singleSoftware;
};

// =============================
// DELETE Software License
// =============================
const removeSoftware = async (softwareId) => {
  const redisClient = getRedisClient();

  const license = await IndividualSoftware.findById(softwareId);

  if (!license) {
    throw new Error("No license found for delete");
  }

  const modelId = license.softwareModelId;
  const status = license.status;

  const deleteResult = await IndividualSoftware.deleteOne({ _id: softwareId });

  if (deleteResult.deletedCount > 0) {
    const software = await Software.findById(modelId);

    if (software) {
      software.totalLicenses = Math.max(0, (software.totalLicenses || 0) - 1);

      if (status === "Assigned") {
        software.usedLicenses = Math.max(0, (software.usedLicenses || 0) - 1);
      }

      await software.save();
    }
  }

  if (redisClient && redisClient.isOpen) {
    await redisClient.del(`individualSoftware:${softwareId}`);
  }

  await clearCommonCache();

  return deleteResult;
};

// =============================
// UPDATE Software License
// =============================
const modifySoftware = async (softwareId, data) => {
  const redisClient = getRedisClient();

  const oldLicense = await IndividualSoftware.findById(softwareId);

  if (!oldLicense) {
    throw new Error("No license found for update");
  }

  const oldStatus = oldLicense.status;
  const newStatus = data.status;

  const updated = await IndividualSoftware.findByIdAndUpdate(softwareId, data, {
    new: true,
    runValidators: true,
  });

  if (updated) {
    if (newStatus && oldStatus !== newStatus) {
      const software = await Software.findById(updated.softwareModelId);

      if (software) {
        if (oldStatus === "Assigned") {
          software.usedLicenses = Math.max(0, (software.usedLicenses || 0) - 1);
        }

        if (newStatus === "Assigned") {
          software.usedLicenses = (software.usedLicenses || 0) + 1;
        }

        await software.save();
      }
    }

    await checkAndNotify(updated);
  }

  if (redisClient && redisClient.isOpen) {
    await redisClient.del(`individualSoftware:${softwareId}`);
  }

  await clearCommonCache();

  return updated;
};

module.exports = {
  createSoftware,
  getSoftware,
  getOneSoftware,
  removeSoftware,
  modifySoftware,
};