const LaptopAsset = require("../models/Laptop");
const LaptopModel = require("../models/LaptopModel");
const Notification = require("../models/Notification");
const { getRedisClient } = require("../../Config/redisClient");

const clearLaptopModelCache = async () => {
  const redisClient = getRedisClient();

  if (redisClient && redisClient.isOpen) {
    const keys = await redisClient.keys("laptopModel:list:*");

    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  }
};

const clearCommonCache = async () => {
  const redisClient = getRedisClient();

  if (redisClient && redisClient.isOpen) {
    await redisClient.del("dashboard:data");
    await clearLaptopModelCache();
  }
};

const checkLaptopLife = async (laptop) => {
  const now = new Date();
  const startDate = laptop.purchaseDate || laptop.createdAt || now;
  const ageInMonths = Math.floor(
    (now - startDate) / (1000 * 60 * 60 * 24 * 30.44)
  );

  if (ageInMonths >= 33 && !laptop.isNearEOL) {
    laptop.isNearEOL = true;
    await laptop.save();

    await Notification.create({
      title: "Laptop Nearing End-of-Life",
      message: `Asset ${laptop.serialNumber} (${laptop.modelName || "Laptop"}) is ${ageInMonths} months old and requires replacement planning.`,
      type: "Warning",
      category: "Laptop",
      relatedModel: "Laptop",
      relatedId: laptop._id,
      targetRole: "IT Operations",
    });
  }
};

const createLaptop = async (laptopData) => {
  const existingLaptop = await LaptopAsset.findOne({
    serialNumber: laptopData.serialNumber,
  });

  if (existingLaptop) {
    throw new Error("A laptop with this serial number already exists.");
  }

  const laptop = new LaptopAsset(laptopData);
  await laptop.save();

  await checkLaptopLife(laptop);

  const laptopModel = await LaptopModel.findById(laptop.laptopModelId);

  if (laptopModel) {
    laptopModel.totalAssets = (laptopModel.totalAssets || 0) + 1;

    if (laptop.status === "Available" || laptop.status === "Avaliable") {
      laptopModel.avaliable = (laptopModel.avaliable || 0) + 1;
    } else if (laptop.status === "Assigned") {
      laptopModel.inUse = (laptopModel.inUse || 0) + 1;
    } else if (laptop.status === "Under Repair") {
      laptopModel.underRepair = (laptopModel.underRepair || 0) + 1;
    } else if (laptop.status === "Retired") {
      laptopModel.retired = (laptopModel.retired || 0) + 1;
    }

    await laptopModel.save();
  }

  await clearCommonCache();

  return laptop;
};

const getLaptop = async (
  page,
  limit,
  modelId,
  search,
  statusFilter,
  conditionFilter
) => {
  const skip = (page - 1) * limit;

  const filter = {};

  if (search && search.trim() !== "") {
    filter.$or = [{ serialNumber: { $regex: search, $options: "i" } }];
  }

  if (statusFilter && statusFilter !== "All") {
    filter.status = statusFilter;
  }

  if (conditionFilter && conditionFilter !== "All") {
    filter.condition = conditionFilter;
  }

  const modelFilter = modelId ? { ...filter, laptopModelId: modelId } : filter;

  const allLaptopAssets = await LaptopAsset.find();

  const existingLaptopAssets = await LaptopAsset.find(modelFilter)
    .populate("laptopModelId", "modelName brand")
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit);

  const totalAssets = await LaptopAsset.countDocuments(
    modelId ? { laptopModelId: modelId } : {}
  );

  const totalPages = Math.ceil(totalAssets / limit);

  const statsFilter = modelId ? { laptopModelId: modelId } : {};

  const stats = {
    total: totalAssets,
    avaliable: await LaptopAsset.countDocuments({
      ...statsFilter,
      status: { $in: ["Available", "Avaliable"] },
    }),
    assigned: await LaptopAsset.countDocuments({
      ...statsFilter,
      status: "Assigned",
    }),
    repair: await LaptopAsset.countDocuments({
      ...statsFilter,
      status: "Under Repair",
    }),
    retired: await LaptopAsset.countDocuments({
      ...statsFilter,
      status: "Retired",
    }),
    damaged: await LaptopAsset.countDocuments({
      ...statsFilter,
      condition: "Damaged",
    }),
  };

  const modelName =
    existingLaptopAssets[0]?.laptopModelId?.modelName || "";

  return {
    allLaptopAssets,
    existingLaptopAssets,
    modelName,
    totalPages,
    stats,
  };
};

const getOneLaptop = async (laptopId) => {
  const singleLaptop = await LaptopAsset.findById(laptopId).populate(
    "laptopModelId",
    "modelName brand"
  );

  if (!singleLaptop) {
    throw new Error("No specific laptop found in the inventory.");
  }

  return singleLaptop;
};

const removeLaptop = async (laptopId) => {
  const laptop = await LaptopAsset.findById(laptopId);

  if (!laptop) {
    throw new Error("No laptop found for delete");
  }

  const modelId = laptop.laptopModelId;
  const status = laptop.status;

  const deleteResult = await LaptopAsset.deleteOne({ _id: laptopId });

  if (deleteResult.deletedCount > 0) {
    const laptopModel = await LaptopModel.findById(modelId);

    if (laptopModel) {
      laptopModel.totalAssets = Math.max(
        0,
        (laptopModel.totalAssets || 0) - 1
      );

      if (status === "Available" || status === "Avaliable") {
        laptopModel.avaliable = Math.max(
          0,
          (laptopModel.avaliable || 0) - 1
        );
      } else if (status === "Assigned") {
        laptopModel.inUse = Math.max(0, (laptopModel.inUse || 0) - 1);
      } else if (status === "Under Repair") {
        laptopModel.underRepair = Math.max(
          0,
          (laptopModel.underRepair || 0) - 1
        );
      } else if (status === "Retired") {
        laptopModel.retired = Math.max(0, (laptopModel.retired || 0) - 1);
      }

      await laptopModel.save();
    }
  }

  await clearCommonCache();

  return deleteResult;
};

const modifyLaptop = async (laptopId, data) => {
  const oldLaptop = await LaptopAsset.findById(laptopId);

  if (!oldLaptop) {
    throw new Error("No laptop found for update");
  }

  const oldStatus = oldLaptop.status;
  const newStatus = data.status;

  const updated = await LaptopAsset.findByIdAndUpdate(laptopId, data, {
    new: true,
    runValidators: true,
  });

  if (updated) {
    await checkLaptopLife(updated);

    if (newStatus && oldStatus !== newStatus) {
      const laptopModel = await LaptopModel.findById(updated.laptopModelId);

      if (laptopModel) {
        if (oldStatus === "Available" || oldStatus === "Avaliable") {
          laptopModel.avaliable = Math.max(
            0,
            (laptopModel.avaliable || 0) - 1
          );
        } else if (oldStatus === "Assigned") {
          laptopModel.inUse = Math.max(0, (laptopModel.inUse || 0) - 1);
        } else if (oldStatus === "Under Repair") {
          laptopModel.underRepair = Math.max(
            0,
            (laptopModel.underRepair || 0) - 1
          );
        } else if (oldStatus === "Retired") {
          laptopModel.retired = Math.max(0, (laptopModel.retired || 0) - 1);
        }

        if (newStatus === "Available" || newStatus === "Avaliable") {
          laptopModel.avaliable = (laptopModel.avaliable || 0) + 1;
        } else if (newStatus === "Assigned") {
          laptopModel.inUse = (laptopModel.inUse || 0) + 1;
        } else if (newStatus === "Under Repair") {
          laptopModel.underRepair = (laptopModel.underRepair || 0) + 1;
        } else if (newStatus === "Retired") {
          laptopModel.retired = (laptopModel.retired || 0) + 1;
        }

        await laptopModel.save();
      }
    }
  }

  await clearCommonCache();

  return updated;
};

module.exports = {
  createLaptop,
  getLaptop,
  getOneLaptop,
  removeLaptop,
  modifyLaptop,
};