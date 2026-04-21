const {
  createLaptopModel,
  getLaptopModel,
  getOneLaptopModel,
  removeLaptopModel,
  modifyLaptopModel,
} = require("../../service-layer/services/LaptopModelService");

const addLaptopModels = async (req, res, next) => {
  try {
    const newLaptop = await createLaptopModel(req.body);
    res.status(201).json({
      success: true,
      message: "Laptop Model created successfully",
      newLaptop
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
const getAllLaptopsModels = async (req, res, next) => {
  try {
    const search=req.query.search;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const getLaptop = await getLaptopModel(page,limit,search);
    res.status(200).json({
      success: true,
      message: "Laptop readed successfully",
      ... getLaptop,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getLaptopModelById = async (req, res, next) => {
  try {
    const laptopId = req.params.id;
    const singleLaptop = await getOneLaptopModel(laptopId);
    res.status(201).json({
      success: true,
      message: "One Specific Laptop readed successfully",
       singleLaptop
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
const deleteLaptopModel = async (req, res, next) => {
  try {
    const laptopId = req.params.id;
    const singleLaptopDelete = await removeLaptopModel(laptopId);
    res.status(201).json({
      success: true,
      message: "One Specific Laptop deleted successfully",
      laptop: singleLaptopDelete,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
const updateLaptopModel = async (req, res, next) => {
  try {
    const laptopId = req.params.id;
    const updatedLaptopModel = await modifyLaptopModel(laptopId, req.body);
    res.status(201).json({
      success: true,
      message: "One Specific Laptop updated successfully",
      updatedLaptopModel,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  addLaptopModels,
  getAllLaptopsModels,
  getLaptopModelById,
  deleteLaptopModel,
  updateLaptopModel,
};
