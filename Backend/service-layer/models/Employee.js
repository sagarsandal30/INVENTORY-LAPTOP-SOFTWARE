const mongoose=require("mongoose");

const EmployeeSchema=new mongoose.Schema({
fullName:{
    type:String,
    required:true,  
},

email:{
    type:String,
    required:true,
},
department:{
    type:String,
    enum: ["Engineering",
  "IT Operations",
  "HR",
  "Finance",
  "Design",
  "Marketing",
  "Sales",
  "Analytics",
  "QA"],
    required:true,
},
role:{
    type:String,
    enum: ["Employee","Admin","Manager","IT Operations"],
    default:"Employee",
    required:true
},
phoneNumber:{
    type:String,
    required:true,
},
location:{
    type:String,
    enum:["Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Ahmedabad",
  "Kochi"],
    required:true,
},
joinDate:{
    type:Date,
    required:true
},
status:{
    type:String,
    enum:["Active","Inactive"],
    default:"Active",
},
laptopAssigned:{
    type:Number,
    default:0
},
softwareAssigned:{
    type:Number,
    default:0

},
},
{
    timestamps:true
}
);
module.exports=mongoose.model("Employee",EmployeeSchema);