const {
  getProfileService,
  updateProfileService,
} = require("../../service-layer/services/SettingsService");

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const data = await getProfileService(userId);

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const data = await updateProfileService(userId, req.body);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


 

module.exports = {
  getProfile,
  updateProfile,
};