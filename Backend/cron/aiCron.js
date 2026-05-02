const cron = require("node-cron");
const LaptopAsset = require("../service-layer/models/Laptop");
const RepairHistory = require("../service-layer/models/RepairHistory");
const IndividualSoftware = require("../service-layer/models/IndividualSoftware");
const Notification = require("../service-layer/models/Notification");
const aiService = require("../service-layer/services/AiService");

/**
 * Weekly AI Analysis & Asset Lifecycle Cron Job
 * Runs every Sunday at 00:00
 */
const initAiCron = () => {
  cron.schedule("0 0 * * 0", async () => {
    console.log("Starting Weekly Automated Asset Review...");
    
    try {
      const now = new Date();

      // 1. Laptop Lifecycle & AI Analysis
      const assets = await LaptopAsset.find();
      for (const asset of assets) {
        const startDate = asset.purchaseDate || asset.createdAt || new Date();
        const ageInMonths = Math.floor((now - startDate) / (1000 * 60 * 60 * 24 * 30.44));
        const repairCount = await RepairHistory.countDocuments({ laptopAssetId: asset._id });

        if (ageInMonths >= 33 && !asset.isNearEOL) {
          asset.isNearEOL = true;
          await asset.save();

          // Create Notification for EOL
          await Notification.create({
            title: "Laptop Nearing End-of-Life",
            message: `Asset ${asset.serialNumber} (${asset.modelName}) is ${ageInMonths} months old and requires replacement planning.`,
            type: "Warning",
            category: "Laptop",
            relatedModel: "Laptop",
            relatedId: asset._id,
            targetRole: "IT Operations"
          });
        }

        if (ageInMonths > 24 || repairCount > 1) {
          try {
            await aiService.predictFailure(asset._id);
          } catch (err) {
            console.error(`Failed to analyze laptop ${asset._id}:`, err.message);
          }
        }
      }

      // 2. Software License Renewal Alerts (30/60/90 days)
      const licenses = await IndividualSoftware.find({ status: { $ne: "Expired" } }).populate("softwareModelId");
      for (const license of licenses) {
        if (!license.expiryDate) continue;

        const daysLeft = Math.ceil((new Date(license.expiryDate) - now) / (1000 * 60 * 60 * 24));
        let newStatus = "Active";

        if (daysLeft <= 0) newStatus = "Expired";
        else if (daysLeft <= 30) newStatus = "Critical";
        else if (daysLeft <= 90) newStatus = "Expiring Soon";

        if (license.renewalStatus !== newStatus) {
          license.renewalStatus = newStatus;
          if (daysLeft <= 0) license.status = "Expired";
          await license.save();

          // Create Notification for Software Expiry
          if (newStatus !== "Active") {
            const softwareName = license.softwareModelId?.softwareName || "Software";
            
            // Check if notification already exists for this week to avoid spam
            const existing = await Notification.findOne({
                relatedId: license._id,
                createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
            });

            if (!existing) {
                await Notification.create({
                    title: `Software License ${newStatus}`,
                    message: `License key ${license.licenseKey} for ${softwareName} is ${newStatus.toLowerCase()}. Expiry: ${new Date(license.expiryDate).toLocaleDateString()}`,
                    type: newStatus === "Expired" || newStatus === "Critical" ? "Critical" : "Warning",
                    category: "Software",
                    relatedModel: "Software",
                    relatedId: license._id,
                    targetRole: "IT Operations"
                });
            }
          }
        }
      }
      
      console.log("Weekly Asset Review Completed Successfully.");
    } catch (error) {
      console.error("Cron Job Error:", error);
    }
  });
};

module.exports = initAiCron;
