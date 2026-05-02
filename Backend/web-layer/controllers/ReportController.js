const { getReportData } = require("../../service-layer/services/ReportService");

const getReports = async (req, res) => {
    try {
        const data = await getReportData();
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Report Generation Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate report data",
            error: error.message
        });
    }
};

module.exports = { getReports };
