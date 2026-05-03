const { createClient } = require("redis");

let redisClient = null;

const connectRedis = async () => {
  try {
    // ✅ Check if REDIS_URL exists
    if (!process.env.REDIS_URL) {
      console.log("⚠️ Redis URL not found. Running without Redis.");
      return;
    }

    redisClient = createClient({
      url: process.env.REDIS_URL,
       tls: true,
    rejectUnauthorized: false
    });

    redisClient.on("error", (err) => {
      console.error("Redis error:", err.message);
    });

    await redisClient.connect();

    console.log("✅ Redis connected");
  } catch (error) {
    console.log("⚠️ Redis failed, continuing without cache");
    redisClient = null;
  }
};

module.exports = { redisClient, connectRedis };