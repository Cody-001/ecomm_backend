const mongoose = require("mongoose")
const userSchema = new mongoose.Schema( {
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        unique: true
    },
    role:{
            type: String,
            enum:["user", "admin"],
            default: "user"
        },
    password:{
        type:String,
        required: true
    },
    cartData:{
        type: Object,

    },
    
    createdAt:{
        type: Date,
        default: Date.now()
    }
})
module.exports = mongoose.model("User", userSchema);