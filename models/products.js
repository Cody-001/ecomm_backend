const mongoose = require("mongoose")
const productSchema = new mongoose.Schema( {
    id: {
        type: Number,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    
    image:{
        type: String,
        required: true
    },
    category:{
        type:String,
        required: true
    },
    subcategory:{
        type:String,
        required: true
    },
    new_price: {
        type: Number,
        required: true
    },
      old_price: {
        type: Number,
        required: true
    },
    available:{
        type: Boolean,
        default: true
    },
    createdAt:{
        type: Date,
        default: Date.now()
    }
})
module.exports = mongoose.model("Product", productSchema);