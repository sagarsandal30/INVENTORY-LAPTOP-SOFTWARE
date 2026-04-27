const mongoose = require("mongoose");

const SoftwareSchema = new mongoose.Schema(
    {
    softwareName: {
      type: String,
      required: true,
      trim: true
    },
    vendor: {
      type: String,
      required: true,
      enum: [
        "Microsoft",
        "Adobe",
        "Google",
        "Oracle",
        "Autodesk",
        "Atlassian",
        "Slack",
        "Zoom",
        "VMware",
        "Other"
      ]
    },
    category: {
      type: String,
      enum: [
        "Productivity",
        "Design",
        "Development",
        "Security",
        "Engineering",
        "Communication",
        "Database",
        "Analytics",
        "Other"
      ],
      default: "Productivity"
    },
    licenseType: {
      type: String,
      enum: ["Subscription", "Perpetual", "Per Seat", "Open Source"],
      required: true,
      default: "Subscription"
    },

    totalLicenses: {
      type: Number,
      required: true,
      min: 1
    },
    usedLicenses: {
      type: Number,
      default: 0,
      validate: {
        validator: function (value) {
          // Context handling for Mongoose updates vs saves
          const total = this.totalLicenses !== undefined 
             ? this.totalLicenses 
             : (this.getUpdate ? this.getUpdate().$set?.totalLicenses || this.getUpdate().totalLicenses : undefined);
          
          if (total === undefined) return true; 
          return value <= total;
        },
        message: "Used licenses cannot exceed total licenses",
      }
    },
    
    

    costPerMonth: {
      type: Number,
      required: true,
      min: 0
    },


    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
)
module.exports=mongoose.model("Software",SoftwareSchema);

