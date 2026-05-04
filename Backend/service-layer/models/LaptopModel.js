const mongoose = require("mongoose");

const LaptopSchema = new mongoose.Schema(
    {
        modelName:{
            type:String,
            required:true,

        },
        brand:{
            type:String,
            enum: [
      "Dell",
      "Apple",
      "HP",
      "Lenovo",
      "ASUS",
      "Acer",
      "Microsoft",
      "MSI",
      "Razer",
      "Samsung",
      "Other"
    ],
    required:true,
    },

    processor:{
    type:String,
    required:true
    },

    ram:{
        type:String,
        required:true
    },

    storage:{
        type:String,
        required:true
    },

     graphicsCard: { 
      type: String 
    },
    screenSize: { 
      type: String ,
      required:true
    },
   
    weight: { 
      type: String 
    },
    batteryLife: { 
      type: String 
    },
    ports: { 
      type: String 
    },
    operatingSystem: { 
      type: String,
      enum: [
      "Windows 11 Pro",
      "Windows 11 Home",
      "macOS",
      "Linux",
      "Chrome OS"
    ] ,
    required:true
    },
    purchaseDate:{
        type: Date,
        required:true
    },
    warrantyPeriod: { 
      type: String 
    },
    price: { 
      type: Number, 
      required: true 
    },
    additionalSpecifications:{
        type: String
    },
    totalAssets: {
      type: Number,
      required:true,
      default: 0,
      min: 0
    },
    avaliable:{
      type:Number,
      default:0
    },
    inUse:{
      type:Number,
      default:0
    },
    underRepair:{
      type:Number,
      default:0
    },
    retired:{
      type:Number,
      default:0
    }
},
 { 
    // Automatically adds `createdAt` and `updatedAt` timestamps
    timestamps: true 
  }
);

module.exports=mongoose.model("LaptopModel",LaptopSchema);