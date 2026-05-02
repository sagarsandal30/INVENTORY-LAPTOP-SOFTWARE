const aiService = require("../../service-layer/services/AiService");

const predictFailure = async (req, res) => {
  try {
    const { assetId } = req.params;
    const result = await aiService.predictFailure(assetId);
    res.status(200).json({ 
      success: true, 
      data: result
     });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const getHighRiskLaptops = async (req, res) => {
  try {
    const result = await aiService.getHighRiskLaptops();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBrandFailureAnalysis = async (req, res) => {
  try {
    const result = await aiService.getBrandFailureAnalysis();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  predictFailure,
  getHighRiskLaptops,
  getBrandFailureAnalysis
};
