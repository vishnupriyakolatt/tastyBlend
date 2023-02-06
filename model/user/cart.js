const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema;
const cartSchema = new Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      
    },
    product: [
      {
        productId: {
          type:mongoose.Types.ObjectId,
          required: true,
        },
        quantity: {
          type: Number,
       
        },
        
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Carts = mongoose.model('cart', cartSchema);
module.exports = Carts;
