const mongoose = require("mongoose")
const adminSchema = new mongoose.Schema( {

    email:{
        type: String,
        unique: true
    },
    
    password:{
        type:String,
        required: true
    },
    role:{
            type: String,
            enum:["user", "admin"],
            default: "admin"
        },

    
    createdAt:{
        type: Date,
        default: Date.now()
    }
})
module.exports = mongoose.model("admin", adminSchema);