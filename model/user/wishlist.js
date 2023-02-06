const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema;
const wishlistSchema = new Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    product: [
      {
        productId: {
          type:mongoose.Types.ObjectId,
          required: true,
        },
        
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
module.exports = Wishlist;
