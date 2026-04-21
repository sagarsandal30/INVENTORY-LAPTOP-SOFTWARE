const {
  createLaptop,
  getLaptop,
  getOneLaptop,
  removeLaptop,
  modifyLaptop,
} = require("../../service-layer/services/LaptopService");

const addLaptop = async (req, res, next) => {
  try {
    const newLaptop = await createLaptop(req.body);
    res.status(201).json({
      success: true,
      message: "Laptop created successfully",
       newLaptop,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
const getAllLaptops = async (req, res, next) => {
  try {
    const {page,limit,modelId,search,statusFilter,conditionFilter}=req.query;
    const newLaptop = await getLaptop(page,limit,modelId,search,statusFilter,conditionFilter);
    
    res.status(200).json({
      success: true,
      message: "Laptop readed successfully",
      ... newLaptop,
    });
  } catch (error) {
    console.log("inside catch")
    res.status(400).json({ success: false, message: error.message });
  }
};

const getLaptopByID = async (req, res, next) => {
  
  try {
    const laptopId = req.params.id;
    const singleLaptop = await getOneLaptop(laptopId);
    res.status(201).json({
      success: true,
      message: "One Specific Laptop readed successfully",
      laptop: singleLaptop,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
const deleteLaptop = async (req, res, next) => {
  try {
    const laptopId = req.params.id;
    const singleLaptopDelete = await removeLaptop(laptopId);
    res.status(201).json({
      success: true,
      message: "One Specific Laptop deleted successfully",
      laptop: singleLaptopDelete,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
const updateLaptop = async (req, res, next) => {
  try {
    const laptopId = req.params.id;
    const updateLaptop = await modifyLaptop(laptopId, req.body);
    res.status(201).json({
      success: true,
      message: "One Specific Laptop updated successfully",
       updateLaptop,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  addLaptop,
  getAllLaptops,
  getLaptopByID,
  deleteLaptop,
  updateLaptop,
};
