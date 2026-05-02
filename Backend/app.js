const express = require("express");
const cors = require("cors");
require('dotenv').config();

//connect Redis
const { connectRedis } = require("./Config/redisClient");
// Connect DB
const connectDB = require("./service-layer/db/connect");
const queryRoutes = require("./web-layer/routes/QueryRoutes");
const router = require("./web-layer/routes/AuthRoutes");
// Future routes
const laptopModelRouter = require("./web-layer/routes/LaptopModelRoutes");
const laptopRouter = require("./web-layer/routes/LaptopRoutes");
const softwareRouter = require("./web-layer/routes/SoftwareRoutes");
const employeeRouter = require("./web-layer/routes/EmployeeRoutes");
const assignmentRouter = require("./web-layer/routes/AssignmentRoutes");
const dashboardRouter = require("./web-layer/routes/DashboardRoutes");
const settingsRouter=require("./web-layer/routes/Setting");
const notificationRouter=require("./web-layer/routes/NotificationRoutes");
const aiRouter = require("./web-layer/routes/aiRoutes");
const individualSoftwareRouter = require("./web-layer/routes/IndividualSoftwareRoute");
const reportRouter = require("./web-layer/routes/ReportRoutes");
const myAssetsRouter = require("./web-layer/routes/MyAssetsRoute");
const initAiCron = require("./cron/aiCron");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", router);

app.use("/api/laptopsModels",laptopModelRouter);
app.use("/api/laptop",laptopRouter);
app.use("/api/software",softwareRouter);
app.use("/api/employee",employeeRouter);
app.use("/api",assignmentRouter);
app.use("/api",dashboardRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/queries", queryRoutes);
app.use("/api/notifications",notificationRouter);
app.use("/api/ai", aiRouter);
app.use("/api/software-licenses", individualSoftwareRouter);
app.use("/api/reports", reportRouter);
app.use("/api/my-assets", myAssetsRouter);

// Start server
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
  await  connectRedis();
    await connectDB();
    initAiCron();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
