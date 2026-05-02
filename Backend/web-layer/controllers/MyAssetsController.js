const { getMyAssets } = require("../../service-layer/services/MyAssetsService");

const getMyAssignedAssets = async (req, res) => {
    try {
        const userId = req.user.id; // From protect middleware
        const assets = await getMyAssets(userId);
        
        res.status(200).json({
            success: true,
            data: assets
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve your assets"
        });
    }
};

module.exports = { getMyAssignedAssets };
