const mongoose=require('mongoose');

const productSchema=new mongoose.Schema({
    name:String,
    description:String,
    category:String,
    image:Array,
    price:Number,
    quantity:Number,
    status:{
        type:Boolean,
        default:true
      }
})

const Product=mongoose.model('Product',productSchema);

module.exports=Product
