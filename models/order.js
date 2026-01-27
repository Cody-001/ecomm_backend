const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
    firstname: {
      type: String,
      required: true,
      trim: true,
    },

    lastname: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    companyName: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    postcode: {
      type: String,
      required: true,
      trim: true,
    },

    differentAddress: {
      type: Boolean,
      default: false,
    },

    comments: {
      type: String,
      trim: true,
    },

    paymentMethod: {
      type: String,
      enum: ["bank_transfer", "cheque", "paypal"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    totalAmount: {
      type: Number,
      required: true,
    },
    
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("Order", orderSchema);
