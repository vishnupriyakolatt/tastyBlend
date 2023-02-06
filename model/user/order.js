const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const orderSchema = new mongoose.Schema(
  {
    order_id: {
      type: String,
      unique: true,
      required: true,
    },
    user_id: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "userDetails",
    },
    address: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "address",
    },
    products: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        quantity: {
          type: Number,
          required: true,
         
        },
      },
    ],
   
    discount: {
      type: String,
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      default: "Pending",
    },
    orderStatus: {
      type: String,
      default: "Pending",
    },
    order_placed_on: {
      type: String,
      required: true,
    },
    finalAmount: {
      type: Number,
      required: true,
    },
  },
 

  {
    timestamps: true,
  }
);

const Order = mongoose.model("orderDetails", orderSchema);
module.exports = Order;
