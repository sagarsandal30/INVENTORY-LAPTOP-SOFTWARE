const {
  getProfileService,
  updateProfileService,
  updatePasswordService,
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

const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    await updatePasswordService(userId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
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
  updatePassword,
};