const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    profilePic:{
        type:String,
        default:"https://zultimate.com/wp-content/uploads/2019/12/default-profile.png"
    }
})

module.exports=mongoose.model("USER",userSchema);