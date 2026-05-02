const LaptopAsset = require("../models/Laptop");
const Assignment = require("../models/Assignment");
const RepairHistory = require("../models/RepairHistory");
const OpenAI = require("openai");

// Initialize OpenAI (requires OPENAI_API_KEY in .env)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class AiService {
  /**
   * Run AI analysis for one laptop asset
   */
  async predictFailure(assetId) {
    // 1. Fetch laptop asset with populated LaptopModel
    const asset = await LaptopAsset.findById(assetId).populate("laptopModelId");
    if (!asset) throw new Error("Asset not found");

    // 2. Calculate metrics
    const now = new Date();
    const createdAt = asset.createdAt || new Date();
    const ageInMonths = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24 * 30.44));

    const assignments = await Assignment.find({ laptopAssetId: assetId });
    const totalAssignments = assignments.length;
    
    let totalUsageDurationDays = 0;
    assignments.forEach(a => {
      const start = new Date(a.assignDate);
      const end = a.returnDate ? new Date(a.returnDate) : now;
      totalUsageDurationDays += (end - start) / (1000 * 60 * 60 * 24);
    });

    const repairCount = await RepairHistory.countDocuments({ laptopAssetId: assetId });

    // 3. Optimization Logic: Only call AI if age > 24 months OR repairCount > 1
    // We check if it already has metrics and if they are recent (e.g., within last 7 days) to avoid redundant calls
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (asset.aiMetrics?.lastPredictionDate > oneWeekAgo) {
        return asset.aiMetrics;
    }

    if (ageInMonths <= 24 && repairCount <= 1) {
       return {
         message: "Optimization: Analysis skipped (Asset is new and has minimal repairs).",
         predictionScore: 10,
         riskLevel: "Low",
         reason: "The device is less than 24 months old and has had 1 or fewer repairs.",
         aiRecommendation: "Continue regular maintenance."
       };
    }

    // 4. Prepare JSON payload
    const payload = {
      model: asset.laptopModelId.modelName,
      brand: asset.laptopModelId.brand,
      processor: asset.laptopModelId.processor,
      ram: asset.laptopModelId.ram,
      ageInMonths,
      totalAssignments,
      totalUsageDurationDays: Math.floor(totalUsageDurationDays),
      repairCount
    };

    // 5. Call AI API
    try {
      const prompt = `You are a senior IT hardware diagnostic expert. Analyze laptop data and:
1. Give predictionScore (0-100)
2. Assign riskLevel
3. Explain reason
4. Give recommendation

Return ONLY JSON:
{
  "predictionScore": number,
  "riskLevel": "Low" | "Medium" | "High" | "Critical",
  "reason": "string",
  "aiRecommendation": "string"
}

Data: ${JSON.stringify(payload)}`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: "You are a hardware diagnostic assistant." }, { role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const aiResult = JSON.parse(response.choices[0].message.content);

      // 6. Save result in LaptopAsset.aiMetrics
      asset.aiMetrics = {
        ...aiResult,
        lastPredictionDate: now
      };
      await asset.save();

      // Invalidate Redis cache
      const { redisClient } = require("../../Config/redisClient");
      if (redisClient && redisClient.isOpen) {
        await redisClient.del("high_risk_laptops");
      }

      return asset.aiMetrics;

    } catch (error) {
      console.error("AI Service Error:", error.message);
      throw new Error(`AI Prediction failed: ${error.message}`);
    }
  }

  /**
   * Return laptops where riskLevel is High or Critical
   */
  async getHighRiskLaptops() {
    const { redisClient } = require("../../Config/redisClient");
    
    // Redis Caching Logic
    if (redisClient && redisClient.isOpen) {
      const cached = await redisClient.get("high_risk_laptops");
      if (cached) return JSON.parse(cached);
    }

    const highRisk = await LaptopAsset.find({
      "aiMetrics.riskLevel": { $in: ["High", "Critical"] }
    }).populate("laptopModelId");

    if (redisClient && redisClient.isOpen) {
      await redisClient.set("high_risk_laptops", JSON.stringify(highRisk), { EX: 3600 });
    }

    return highRisk;
  }

  /**
   * Brand failure analysis using MongoDB aggregation
   */
  async getBrandFailureAnalysis() {
    return await LaptopAsset.aggregate([
      {
        $lookup: {
          from: "laptopmodels",
          localField: "laptopModelId",
          foreignField: "_id",
          as: "model"
        }
      },
      { $unwind: "$model" },
      {
        $lookup: {
          from: "repairhistories",
          localField: "_id",
          foreignField: "laptopAssetId",
          as: "repairs"
        }
      },
      {
        $group: {
          _id: "$model.brand",
          totalLaptops: { $sum: 1 },
          totalRepairs: { $sum: { $size: "$repairs" } }
        }
      },
      {
        $project: {
          brand: "$_id",
          totalLaptops: 1,
          totalRepairs: 1,
          failureRate: {
            $cond: [
              { $eq: ["$totalLaptops", 0] },
              0,
              { $divide: ["$totalRepairs", "$totalLaptops"] }
            ]
          }
        }
      },
      { $sort: { failureRate: -1 } }
    ]);
  }
}

module.exports = new AiService();
