const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    firstName:{ 
      type: String, 
      required: true 
    },
    lastName: { 
      type: String, 
       required:true
    },
    email: { 
      type: String,
       required: true,
        unique: true 
    },
    phone: { 
      type: String ,
      default: null,
      
    },
    department: { 
      type: String ,
      enum:["Engineering",
  "IT Operations",
  "Human Resources",
  "Finance",
  "Marketing",
  "Sales",
  "Design",
  "Quality Assurance",
  "Customer Support",
  "Analytics",
  "Legal",
  "Administration"],
 
    },
    role: {
      type: String,
      enum: ["Employee", "Manager", "Admin","IT Operations"],
      default: "Employee",
    },
    password:{
  type: String,
      required:true,
    },
    
     phone: {
  type: String,
  default: null,
},
  },
  { timestamps: true }
);

// Hash password before saving to the database
UserSchema.pre("save", async function () {
  // Only hash if the password was modified (or is new)
  if (!this.isModified("password"))
   return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
//  this.confirmPassword=await bcrypt.hash(this.confirmPassword, salt);
});

// Helper method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);