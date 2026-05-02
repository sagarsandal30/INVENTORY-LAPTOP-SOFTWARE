const LaptopAsset = require("../models/Laptop");
const Software = require("../models/Software");
const IndividualSoftware = require("../models/IndividualSoftware");
const Assignment = require("../models/Assignment");
const Employee = require("../models/Employee");
const mongoose = require("mongoose");

const getReportData = async () => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    // 1. Overview Stats
    const totalLaptops = await LaptopAsset.countDocuments();
    const totalSoftwareModels = await Software.countDocuments();
    const totalLicenses = await IndividualSoftware.countDocuments();

    const assignedLaptops = await LaptopAsset.countDocuments({ status: "Assigned" });
    const assignedLicenses = await IndividualSoftware.countDocuments({ status: "Assigned" });

    const expiringSoonLicenses = await IndividualSoftware.countDocuments({
        expiryDate: { $gt: now, $lte: ninetyDaysFromNow }
    });

    const replacementDueLaptops = await LaptopAsset.countDocuments({
        isNearEOL: true
    });

    const totalAssets = totalLaptops + totalLicenses;
    const activeAssignments = assignedLaptops + assignedLicenses;
    const avgUtilization = totalAssets > 0 ? Math.round((activeAssignments / totalAssets) * 100) : 0;

    // 2. Lifecycle Data (Laptops)
    const lifecycleData = await LaptopAsset.find()
        .populate("laptopModelId")
        .populate("assignedTo")
        .sort({ purchaseDate: 1 });

    const formattedLifecycle = lifecycleData.map(asset => {
        const startDate = asset.purchaseDate || asset.createdAt || new Date();
        const ageInMonths = Math.floor((now - startDate) / (1000 * 60 * 60 * 24 * 30.44));
        let status = "Active";
        if (ageInMonths >= 36) status = "Expired";
        else if (ageInMonths >= 33) status = "Replace Soon";

        return {
            id: asset._id,
            assetName: `${asset.modelName} (#${asset.serialNumber.slice(-4)})`,
            type: "Laptop",
            purchaseDate: startDate,
            age: ageInMonths,
            status,
            assignedTo: asset.assignedTo?.fullName || "Unassigned",
            condition: asset.condition
        };
    });

    // 3. Software Expiry Data
    const softwareExpiry = await IndividualSoftware.find({
        expiryDate: { $lte: ninetyDaysFromNow }
    })
    .populate("softwareModelId")
    .populate("assignedTo")
    .sort({ expiryDate: 1 });

    const formattedSoftwareExpiry = softwareExpiry.map(license => {
        const daysLeft = Math.ceil((new Date(license.expiryDate) - now) / (1000 * 60 * 60 * 24));
        let status = "Active";
        if (daysLeft <= 0) status = "Expired";
        else if (daysLeft <= 30) status = "Critical";
        else if (daysLeft <= 90) status = "Upcoming";

        return {
            id: license._id,
            name: license.softwareModelId?.softwareName || "Unknown",
            vendor: license.softwareModelId?.vendor || "Unknown",
            expiryDate: license.expiryDate,
            daysLeft,
            status,
            assignedTo: license.assignedTo?.fullName || "Unassigned",
            licenses: 1, // Individual record
            cost: license.softwareModelId?.costPerMonth || 0
        };
    });

    // 4. Department Allocation
    const deptAllocation = await Employee.aggregate([
        {
            $group: {
                _id: "$department",
                employees: { $sum: 1 }
            }
        }
    ]);

    // This part is complex because we need to link employees to assets
    // For simplicity, we'll fetch assignments per department
    const departmentStats = [];
    for (const dept of deptAllocation) {
        const employeesInDept = await Employee.find({ department: dept._id }).select("_id");
        const employeeIds = employeesInDept.map(e => e._id);

        const laptopsInDept = await LaptopAsset.countDocuments({ assignedTo: { $in: employeeIds } });
        const softwareInDept = await IndividualSoftware.countDocuments({ assignedTo: { $in: employeeIds } });

        departmentStats.push({
            department: dept._id || "Other",
            laptops: laptopsInDept,
            software: softwareInDept,
            employees: dept.employees
        });
    }

    // 5. Assignment History (Last 6 months)
    const history = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthYear = d.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
        const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0);

        // This would ideally come from an audit log or Assignment history table
        // For now, we'll count assignments created in that month
        const laptops = await Assignment.countDocuments({ 
            assetType: "Laptop", 
            createdAt: { $gte: startOfMonth, $lte: endOfMonth } 
        });
        const software = await Assignment.countDocuments({ 
            assetType: "Software", 
            createdAt: { $gte: startOfMonth, $lte: endOfMonth } 
        });

        history.push({
            month: monthYear,
            laptops,
            software,
            total: laptops + software
        });
    }

    return {
        stats: {
            totalAssets,
            activeAssignments,
            expiringLicenses: expiringSoonLicenses,
            replacementDue: replacementDueLaptops,
            avgUtilization,
            forecastGrowth: 5 // Static for now
        },
        lifecycleData: formattedLifecycle,
        softwareExpiry: formattedSoftwareExpiry,
        departmentAllocation: departmentStats,
        assignmentHistory: history
    };
};

module.exports = { getReportData };
