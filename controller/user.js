var User = require("../model/user/userdetail");
var product = require("../model/admin/product");
const Category = require("../model/admin/category");
const mailer = require("../config/otp");
const Carts = require("../model/user/cart");
const mongoose = require("mongoose");
const Wishlist = require("../model/user/wishlist");
const { name } = require("ejs");
const Order = require("../model/user/order");
const Address = require("../model/user/address");
const Banners = require('../model/admin/banner');
const Coupon=require('../model/admin/coupon')
const upload = require('../config/multer')
const moment = require("moment");

const dotenv = require("dotenv");
dotenv.config();

const bcrypt = require("bcrypt");
const Product = require("../model/admin/product");

var paypal = require("paypal-rest-sdk");
const { findOne, find } = require("../model/admin/coupon");

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AR986YBuyOzayvXPq1yaXyQwaZ1oCETTKjCekqO_-iWm_EWpSkI3ZeWu2aNUAMyukJ4aIAkbQNWEqNa-",
  client_secret:
    "EMv8JDX4w_cnnFyAIs29jXVTS9qzOl7YvKuoAaXvNNjc3XMh2uwKar9E1MrWyZf22a-1hZ1S8t9hpgm6",
});
let count;
let wishCount;
let amount;

const getHome = async (req, res) => {
  try {
    let userSession = req.session.userEmail;
    let fname;
    const banners = await Banners.find();
    if (userSession) {
      const userData = await User.findOne({ email: userSession });
      fname = userData.firstName;
      const cartData = await Carts.find({ userId: userData._id });
      const wishlistData = await Wishlist.find({ userId: userData._id });

      if (cartData.length) {
        count = cartData[0].product.length;
      } else {
        count = 0;
      }
      if (wishlistData.length) {
        wishCount = wishlistData[0].product.length;
      } else {
        wishCount = 0;
      }
    }
    const category = await Category.find({});
    await product.find({}, (err, product) => {
    
      if (err) {
        console.log(err);
      } else {

        res.render("user/index", {
          cat: category,
          name: fname,
          data:product,
          sessionData: req.session.userEmail,
          count,banners,
          wishCount,
        });
      }
    });
    
  } catch (error) {
    console.log(error);
  }
};
const getLogin = (req, res) => {
  try {
    res.render("user/login");
  } catch (error) {
    console.log(error);
    res.redirect("/error");
  }
};

const getSignUp = (req, res) => {
  res.render("user/register");
};
const postLogin = async (req, res) => {
  try {
    let email = req.body.email;
    let password = req.body.password;
    const userDetails = await User.findOne({ email: email });
    if (userDetails) {
      const blocked = userDetails.isBlocked;
      if (blocked === false) {
        if (userDetails.password === password) {
          req.session.userEmail = req.body.email;
          console.log("session created" +req.session.userEmail);
          res.redirect("/");
        } else {
          res.render("user/login", {
            wrong: "Invalid login details",
          });
        }
      } else {
        res.render("user/login", {
          wrong2: "You are blocked by the admin",
        });
      }
    } else {
      res.render("user/login", { wrong: "Invalid login details" });
    }
  } catch (error) {
    res.redirect("/error");
    console.log("error");
  }
};
const postSignup = async (req, res) => {
  try {
    req.session.userData = req.body;
    const email = req.body.email;
    const user = await User.findOne({ email: email });
    if (email === user.email) {
      res.render("user/register", {
        wrong: "Email id is already registered",
      });
    }
  } catch (error) {
    let mailDetails = {
      from: "vishnupriyakolatt@gmail.com",
      to: req.body.email,
      subject: "User Verification",
      html: `<p>Your OTP for registration is ${mailer.OTP}</p>`,
    };
    console.log(mailer.OTP);
    mailer.mailTransporter.sendMail(mailDetails, (err, data) => {
      console.log(data);
      if (err) {
        console.log(err);
      } else {
        res.render("user/otp");
        console.log("otp mailed");
      }
    });
  }
};
//resend otp 



const otpVerification = async (req, res) => {
  try {
    if (req.body.otp == mailer.OTP) {
      const user1 = new User(req.session.userData);
      user1.save();
      req.session.destroy();
      res.redirect("/login");
    } else {
      res.render("user/otp", {
        wrong: "You have entered the wrong otp",
      });
    }
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
};
// resndotp

const getLogout = async (req, res) => {
  req.session.destroy();
  console.log(req.session);
  res.render("user/login");
};
const getError = (req, res) => {
  res.render("user/error");
};

const getabout = (req, res) => {
  try {
    let userSession = req.session.userEmail;
    res.render("user/about",{
      sessionData:req.session.userEmail
    });
 
   
  } catch (error) {
    console.log(error);
    res.redirect("/error");
  }
};
//..................................FORGOT PASSSWORD STARTS FROM HERE.........................

const getProductDetails = async (req, res) => {
  try {
    const id = req.query.id;
    const product = await Product.findById({ _id: id });
    const sessionData = req.session.userEmail;
    if (product) {
      await User.findOne({ email: sessionData }).then((userData) => {
        res.render("user/productView", {
          product,
          sessionData: req.session.userEmail,
          count,
          wishCount,
        });
      });
    } else {
      res.redirect("/user/index");
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};

//..................................Address details.......................//
const getUserProfile = async (req, res) => {
  try {
    await User.findOne({ email: req.session.userEmail }).then((userData) => {
      Address.find({ user_id: req.session.userEmail }).then((address) => {
        res.render("user/userProfile", {
          data: userData,
          name: userData.firstName,
          sessionData: req.session.userEmail,
          count,
          address,
          wishCount,
        });
      });
    });
  } catch (error) {
    console.log(error);
    res.redirect("/error");
  }
};

const getAddAddress = async (req, res) => {
  try {
    await User.findOne({ email: req.session.userEmail }).then((userData) => {
      const sessionData = req.session.userEmail;
      res.render("user/addAddress", {
        sessionData,
        count,
        wishCount,
        name: userData.firstName,
      });
    });
  } catch (error) {
    console.log(error);
    res.redirect("/error");
  }
};
const postAddAddress = async (req, res) => {
  try {
    const uid = req.session.userEmail;
    const addressDetails = await new Address({
      user_id: uid,
      address: req.body.address,
      city: req.body.city,
      district: req.body.district,
      state: req.body.state,
      pincode: req.body.pincode,
    });
    await addressDetails.save().then((results) => {
      if (results) {
        res.redirect("/checkout");
      } else {
        res.json({ status: false });
      }
    });
  } catch (error) {
    console.log(error);
    res.redirect("/error");
  }
};
const changePassword = async (req, res) => {
  try {
    const sessionData = req.session.userEmail;
    await User.findOne({ email: req.session.userEmail }).then((userData) => {
      res.render("user/changePassword", {
        sessionData,
        count,
        wishCount,
        name: userData.firstName,
      });
    });
  } catch (error) {
    console.log(error);
    res.redirect("/error");
  }
};
const postChangePassword = async (req, res) => {
  try {
    let fname;
    const sessionData = req.session.userEmail;
    console.log(sessionData);
    const data = req.body;
    const password = data.password;
    const newPassword = data.newPassword;
    const repeatPassword = data.repeatPassword;
    const userData = await User.findOne({ email: sessionData });
    fname = userData.firstName;
    console.log(`this is user data ${userData}`);
    if (userData) {
      if (userData.password === password) {
        console.log(userData.password, password);
        if (newPassword === repeatPassword) {
          await User.updateOne(
            { email: sessionData },
            { $set: { password: password } }
          )
            .then(() => {
              // req.session.destroy();
              res.redirect("/login");
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          res.render("user/changePassword", {
            err_message: "new password and repeat password are not matching",
            sessionData,
            name: fname,
            count,
            wishCount,
          });
        }
      } else {
        res.render("user/changePassword", {
          err_message: "current password are not matching",
          sessionData,
          name: fname,
          count,
          wishCount,
        });
      }
    } else {
      console.log("error");
    }
  } catch {
    console.error();
    res.redirect("/error");
  }
};
const getEditProfile = async (req, res) => {
  try {
    const sessionData = req.session.userEmail;
    await User.findOne({ email: sessionData }).then((userData) => {
      res.render("user/editProfile", {
        userData,
        sessionData,
        count,
        wishCount,
      });
    });
  } catch {
    console.error();
    res.redirect("/error");
  }
};
const postEditProfile = async (req, res) => {
  try {
    const sessionData = req.session.userEmail;
    const data = req.body;
    await User.updateOne(
      { email: sessionData },
      {
        $set: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          phone: data.phone,
        },
      }
    );
    res.redirect("/userProfile");
  } catch {
    console.error();
    res.redirect("/error");
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.session.userEmail;
    let fname;
    const userData = await User.findOne({ email: userId });
    fname = userData.firstName;
    const cartData = await Carts.find({ userId: userData._id });

    if (cartData.length) {
      count = cartData[0].product.length;
    } else {
      count = 0;
    }
    const cart = await Carts.aggregate([
      {
        $match: { userId: userData._id },
      },
      {
        $unwind: "$product",
      },
      {
        $project: {
          productItem: "$product.productId",
          productQuantity: "$product.quantity",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productItem",
          foreignField: "_id",
          as: "productDetail",
        },
      },
      {
        $project: {
          productItem: 1,
          productQuantity: 1,
          productDetail: { $arrayElemAt: ["$productDetail", 0] },
        },
      },
      {
        $addFields: {
          productPrice: {
            $sum: { $multiply: ["$productQuantity", "$productDetail.price"] },
          },
        },
      },
    ]);
    console.log(cart);
    const sum = cart.reduce(
      (accumulator, object) => accumulator + object.productPrice,
      0
    );

    res.render("user/cart", {
      cart,
      name: fname,
      userData,
      sessionData: req.session.userEmail,
      count,
      sum,
      wishCount,
    });
  } catch (error) {
    res.redirect("/error");
    console.log(error.message);
  }
};
const addToCart = async (req, res) => {
  try {
    let fname;
    const id = req.params.id;
    const userId = req.session.userEmail;
    const data = await Product.findOne({ _id: id });
    const userData = await User.findOne({ email: userId });
    fname = userData.firstName;
    const objId = mongoose.Types.ObjectId(id);
    const idUser = mongoose.Types.ObjectId(userData._id);

    let proObj = {
      productId: objId,
      quantity: 1,
    };
    if (data.quantity >= 1) {
      const userCart = await Carts.findOne({ userId: userData._id });
      if (userCart) {
        let proExist = userCart.product.findIndex((product) => {
          console.log(product);
          console.log(id);
          return product.productId == id;
        });
        if (proExist != -1) {
          res.json({ productExist: true });
        } else {
          console.log("nexted loop is working");
          Carts.updateOne(
            { userId: userData._id },
            { $push: { product: proObj } }
          ).then(() => {
            res.json({ status: true });
          });
          // res.redirect(`/productDetails?id=${id}`);
        }
      } else {
        console.log("this is working");
        const newCart = new Carts({
          userId: userData._id,
          product: [
            {
              productId: objId,
              quantity: 1,
            },
          ],
        });
        newCart.save().then(() => {
          res.json({ status: true });
          // res.redirect("/productDetails");
        });
      
      }
      
    }
     else {
      console.log("2");
      res.json({ stock: true });
    }
    console.log();
    await product.updateOne({_id:objId},{$inc:{quantity:-1}})
  } catch (error) {
    res.redirect("/error");
    console.log(error.message);
  }
};
const removeProduct = async (req, res) => {
  try {
    console.log("api called");
    const data = req.body;
    const objId = mongoose.Types.ObjectId(data.product);
    await Carts.aggregate([
      {
        $unwind: "$product",
      },
    ]);
    await Carts.updateOne(
      { _id: data.cart, "product.productId": objId },
      { $pull: { product: { productId: objId } } }
    ).then(() => {
      res.json({ status: true });
    });
  } catch (error) {
    console.error();
    res.redirect("/error");
  }
};
const changeQuantity = async (req, res, next) => {
  try {
    console.log("api called");
    const data = req.body;
    console.log(data);
    data.count = Number(data.count);
    data.quantity = Number(data.quantity);
    const objId = mongoose.Types.ObjectId(data.product);
    const productDetail = await Product.findOne({ _id: data.product });
    console.log(objId);
    console.log(productDetail);
    if (data.count == -1 && data.quantity == 1) {
      res.json({ quantity: true });
    } else if (data.count == 1 && data.quantity == productDetail.quantity) {
      res.json({ stock: true });
    } else {
      await Carts.aggregate([
        {
          $unwind: "$product",
        },
      ]).then(() => {
        Carts.updateOne(
          { _id: data.cart, "product.productId": objId },
          { $inc: { "product.$.quantity": data.count } }
        ).then(() => {
          res.json({ status: true });
          next();
        });
      });
    }
  } catch (error) {
    console.error();
    res.redirect("/error");
  }
};

const getWishlist = async (req, res) => {
  try {
    let fname;
    const sessionData = req.session.userEmail;
    const userData = await User.findOne({ email: sessionData });
    fname = userData.firstName;
    const userId = mongoose.Types.ObjectId(userData._id);
    const cartData = await Carts.findOne({ userId: userData.id });
    const wishlistDetails = await Wishlist.findOne({ userId: userData._id });
    wishCount = wishlistDetails?.product?.length;
    if (wishlistDetails == null) {
      wishCount = 0;
    }
    const wishlistData = await Wishlist.aggregate([
      {
        $match: { userId: userId },
      },
      {
        $unwind: "$product",
      },
      {
        $project: {
          productItem: "$product.productId",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productItem",
          foreignField: "_id",
          as: "productDetail",
        },
      },
      {
        $project: {
          productItem: 1,
          productDetail: { $arrayElemAt: ["$productDetail", 0] },
        },
      },
    ]);
    res.render("user/wishlist", {
      sessionData,
      count,
      name: fname,
      wishlistData,
      wishCount,
    });
  } catch (error) {
    console.log(error);
    res.redirect("/error");
  }
};
const addToWishlist = async (req, res) => {
  try {
    const sessionData = req.session.userEmail;
    const id = req.params.id;
    const objId = mongoose.Types.ObjectId(id);
    let proObj = {
      productId: objId,
    };

    const userData = await User.findOne({ email: sessionData });
    const userId = mongoose.Types.ObjectId(userData._id);
    const userWishlist = await Wishlist.findOne({ userId: userId });
    const verify = await Carts.findOne(
      { userId: userId },
      { product: { $elemMatch: { productId: objId } } }
    );
    if (userWishlist) {
      let proExist = userWishlist.product.findIndex(
        (product) => product.productId == id
      );
      if (proExist != -1) {
        res.json({ productExist: true });
      } else {
        Wishlist.updateOne(
          { userId: userId },
          { $push: { product: proObj } }
        ).then(() => {
          res.json({ status: true });
        });
      }
    } else {
      Wishlist.create({
        userId: userId,
        product: [
          {
            productId: objId,
          },
        ],
      }).then(() => {
        res.json({ status: true });
      });
    }
  } catch (error) {
    console.log(error);
    res.redirect("/error");
  }
};
const removewishlistProduct = async (req, res) => {
  try {
    const data = req.body;
    const objId = mongoose.Types.ObjectId(data.productId);
    await Wishlist.aggregate([
      {
        $unwind: "$product",
      },
    ]);
    await Wishlist.updateOne(
      { _id: data.wishlistId, "product.productId": objId },
      { $pull: { product: { productId: objId } } }
    ).then(() => {
      res.json({ status: true });
    });
  } catch {
    console.error();
    res.redirect("/error");
  }
};

const getCheckout = async (req, res) => {
  try {
    let fname;
    const userId = req.session.userEmail;
    const userData = await User.findOne({ email: userId });
    fname = userData.firstName;
    const cart = await Carts.aggregate([
      {
        $match: { userId: userData._id },
      },
      {
        $unwind: "$product",
      },
      {
        $project: {
          productItem: "$product.productId",
          productQuantity: "$product.quantity",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productItem",
          foreignField: "_id",
          as: "productDetail",
        },
      },
      {
        $project: {
          productItem: 1,
          productQuantity: 1,
          productDetail: { $arrayElemAt: ["$productDetail", 0] },
        },
      },
      {
        $addFields: {
          productPrice: {
            $sum: { $multiply: ["$productQuantity", "$productDetail.price"] },
          },
        },
      },
    ]);
    const sum = cart.reduce(
      (accumulator, object) => accumulator + object.productPrice,
      0
    );

    Address.find({ user_id: userId }).then((address) => {
      res.render("user/checkout", {
        cart,
        wishCount,
        name: fname,
        sessionData: req.session.userEmail,
        count,
        sum,
        address,
      });
    });
  } catch (error) {
    console.log(error);
    res.redirect("/error");
  }
};

const placeOrder = async (req, res) => {
  try {
      const sessionData = req.session.userEmail
      
      
      const data = req.body
     
      const address = data.address
      const payment = data.paymentMethod
      const userData = await User.findOne({ email: sessionData });

      const userDetails = await User.findOne({ email: sessionData }).then(async () => {
          const productData = await Carts.aggregate([
              {
                  $match: { userId: userData._id },
              },
              {
                  $unwind: "$product",
              },
              {
                  $project: {
                      productItem: "$product.productId",
                      productQuantity: "$product.quantity",
                  },
              },
              {
                  $lookup: {
                      from: "products",
                      localField: "productItem",
                      foreignField: "_id",
                      as: "productDetail",
                  },
              },
              {
                  $project: {
                      productItem: 1,
                      productQuantity: 1,
                      productDetail: { $arrayElemAt: ["$productDetail", 0] },
                  },
              },
              {
                  $addFields: {
                      productPrice: {
                          $sum: { $multiply: ['$productQuantity', '$productDetail.price'] },
                      },
                  },
              },
          ])
          let dis = 0
          let sumTotal = 0
          const sum = productData.reduce((accumulator, object) => {
              return accumulator + object.productPrice
          }, 0);

          sumTotal = sum
          console.log(sum);
          count = productData.length;
          console.log(count);
          Carts.findOne({ userId: userData._id }).then((cartData) => {
              const order = new Order({
                  order_id: Date.now(),
                  user_id: userData._id,

                  address: address,
                  order_placed_on: moment().format('DD-MM-YYYY'),
                  products: cartData.product,
                  discount: dis,
                  totalAmount: sumTotal,
                  finalAmount: sumTotal,
                  paymentMethod: payment,
                 
              });
              

              order.save().then((done) => {


                  const oid = done._id;
                  console.log('order saved');
                  Carts.deleteOne({ userId: userData._id }).then(() => {
                      if (payment === 'COD') {
                          res.json({ successCod: true });
                      } else if (payment === 'Online') {
                       Order.findOneAndUpdate({_id:oid},{$set:{paymentStatus:"paid"}})
                           amount = Math.round(done.finalAmount / 84)
                           req.session.amount=amount
                          console.log(amount);
                          res.json({ successPay: true })
                        
                      }
                  });
              });

          })
      })



  } catch (error) {
      console.log(error);
      res.redirect('/error')
  }
}

// -------------------------------pay pal-------------
const getPay = async (req, res) => {
  // function getPay(req, res) {
    
  // }
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "https://tastyblends.online/success",
      cancel_url: "http://tastyblends.online/cancel",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Red Sox Hat",
              sku: "001",
              price: req.session.amount,
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: req.session.amount,
        },
        description: "Hat for the best team ever",
      },
    ],
  };
  console.log( create_payment_json);
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
  
};
const getSuccess = async (req, res) => {

  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: req.session.amount,
        },
      },
    ],
  };

  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    function (error, payment) {
      if (error) {
        console.log(error.response);
        throw error;
        return false

      } else {
        console.log(JSON.stringify(payment));
        res.redirect("/orderSuccess");
        return true

      }
    }
  );
};

const getCancel = async (req, res) => {
  res.send("Cancelled");
};
// ---------------------end pay pal------------
const orderSuccess = async (req, res) => {
  try {
    const sessionData = req.session.userEmail;
    const count = 0;
    await User.findOne({ email: sessionData }).then((userData) => {
      res.render("user/orderSuccess", {
        sessionData,
        count,
        wishCount,
        name: userData.firstName,
      });
    });
  } catch {
    console.error();
    res.redirect("/error");
  }
};
const orderDetails = async (req, res) => {
  try {
    const sessionData = req.session.userEmail;
    let fname;
    const userData = await User.findOne({ email: sessionData });
    fname = userData.firstName;
    const cartData = await Carts.findOne({ userId: userData._id });
    let count = cartData?.product?.length;
    const wishlistData = await Wishlist.findOne({ userId: userData._id });
    let wishCount = wishlistData?.product?.length;
    if (wishlistData == null) {
      wishCount = 0;
    }
    if (cartData == null) {
      count = 0;
    }
    Order.find({ user_id: userData._id })
      .sort({ createdAt: -1 })

      .then((orderDetails) => {
        console.log(orderDetails);
        res.render("user/order", {
          name: fname,
          sessionData,
          count,
          wishCount,
          orderDetails,
        });
      });
  } catch (error) {
    console.log(error);
    res.redirect("/error");
  }
};
const viewOrderProducts = async (req, res) => {
  try {
    const sessionData = req.session.userEmail;
    const id = req.params.id;
    const objId = mongoose.Types.ObjectId(id);
    console.log(objId);
    let fname;
    const userData = await User.findOne({ email: sessionData });
    fname = userData.firstName;
    const cartData = await Carts.findOne({ userId: userData.id });
    let count = cartData?.product?.length;
    const wishlistDetails = await Wishlist.findOne({ userId: userData._id });

    let wishCount = wishlistDetails?.product?.length;
    if (wishlistDetails == null) {
      wishCount = 0;
    }
    if (cartData == null) {
      count = 0;
    }
    Order.aggregate([
      {
        $match: { _id: objId },
      },
      {
        $unwind: "$products",
      },
      {
        $project: {
          address: "$address",
          totalAmount: "$finalAmount",

          productItem: "$products.productId",
          productQuantity: "$products.quantity",
         
            price:"$products.price",
          discount: "$discount",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productItem",
          foreignField: "_id",
          as: "productDetail",
        },
      },
      {
        $project: {
          address: 1,
          totalAmount: 1,
          order_placed_on:1,
          orderStatus:1,
          productItem: 1,
          productQuantity: 1,
          price:1,
          discount: 1,
          productDetail: { $arrayElemAt: ["$productDetail", 0] },
        },
      },
    ]).then((productData) => {
      console.log(productData)
      const addId = productData[0].address;
      Address.find({ _id: addId }).then((address) => {
        console.log(address);
        res.render("user/viewOrderedProduct", {
          name: fname,
          sessionData,
          count,
          productData,
          wishCount,
          address,
        });
      });
    });
  } catch {
    console.error();
    res.redirect("/error");
  }
};
const cancelOrder = async (req, res) => {
  try {
    const data = req.params.id;
    const objId = mongoose.Types.ObjectId(data);
    const orderData = await Order.aggregate([
      {
        $match: { _id: objId },
      },
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "products",
        },
      },
      {
        $project: {
          quantity: "$orderItems.quantity",
          products: { $arrayElemAt: ["$products", 0] },
        },
      },
    ]);
    for (let i = 0; i < orderData.length; i++) {
      const updatedStock = orderData[i].products.stock + orderData[i].quantity;
      Product.updateOne(
        {
          _id: orderData[i].products._id,
        },
        {
          stock: updatedStock,
        }
      ).then((data) => {
        console.log(data);
      });
    }
    Order.updateOne({ _id: data }, { $set: { orderStatus: "Cancelled" } }).then(
      () => {
        res.redirect("/orderDetails");
      }
    );
  } catch {
    console.error();
    res.redirect("/error");
  }
};

const getcategorywise = async (req, res) => {
  res.render("user/categorywise");
};
const categorywise=async(req,res)=>{
  try {
    let userSession = req.session.userEmail;
    let fname;
    const banners = await Banners.find();
    if (userSession) {
      const userData = await User.findOne({ email: userSession });
      fname = userData.firstName;
      const cartData = await Carts.find({ userId: userData._id });
      const wishlistData = await Wishlist.find({ userId: userData._id });

    }
    const category = await Category.find({});
    let cat=req.query.catname;
    console.log(req.body.name);
    console.log(cat);
    await product.find({category:cat}, (err, product) => {
      if (err) {
        console.log(err);
      } else {
        res.render("user/categorywise", {
          cat: category,
          name: fname,
          data: product,
          sessionData: req.session.userEmail,
          count,
          wishCount,
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
};
//coupon details 
const checkCoupon=  async (req, res) => {
  try {
      const data = req.body;
  console.log(data);
  const total = parseInt(data.total);
  const sessionData = req.session.userEmail;
  const userData = await User.findOne({ email: sessionData });
  const objId = mongoose.Types.ObjectId(userData._id);

  if (data.coupon) {
      Coupon
          .find(
              { couponName: data.coupon },
              { users: { $elemMatch: { userId: objId } } }
          )
          .then((exist) => {
              console.log(exist);
              console.log(objId);
              if (!exist.length) {
                  res.json({ invalid: true });
                  console.log("here data is"+data);
              } else if (exist[0].users.length) {
                  res.json({ user: true });
              } else {
                  Coupon.find({ couponName: data.coupon }).then((discount) => {
                      console.log(`discount ${discount}`);
                      console.log(`total ${total}`);
                      let dis = Math.round(total * discount[0].discount);
                      console.log(dis);
                      if (total < 100) {
                          res.json({ purchase: true });
                      } else if (dis > 100000) {
                          let discountAmount = 100000;
                          res.json({
                              coupons: true,
                              discountAmount,
                              couponName: discount[0].couponName,
                          });
                      } else {
                          let discountAmount = dis;
                          res.json({
                              coupons: true,
                              discountAmount,
                              couponName: discount[0].couponName,
                          });
                      }
                  });
              }
          });
  } else {
      res.json({ exist: true });
  }
  } catch (error) {
      console.log(error);
      res.redirect('/error')  
  }
  
}
const forgotpassword=async(req,res)=>{
  res.render("user/forgotpassword")
    
  }
  const forgototp = async (req, res) => {
    try {
    
      const email = req.body.email;
      const user = await User.findOne({ email: email });
      if (email === user.email) {
        req.session.forgoteremail=email
        let mailDetails = {
          from: "vishnupriyakolatt@gmail.com",
          to: req.body.email,
          subject: "User Verification",
          html: `<p>Your OTP for registration is ${mailer.OTP}</p>`,
        };
        console.log(mailer.OTP);
        mailer.mailTransporter.sendMail(mailDetails, (err, data) => {
          console.log(data);
          if (err) {
            console.log(err);
          } else {
            res.render("user/fgototp");
            console.log("otp mailed");
          }
        });
      }  else {
        res.render("user/forgotpassword", {
          wrong: "Email id is invalid",
        });
      }
    } catch (error) {
     res.render("user/error")
    }
  };
  //resend otp 
  
  
  
  const forgototpverify = async (req, res) => {
    try {
      if (req.body.otp == mailer.OTP) {
        res.render("user/forgotupdate")
      } else {
        res.render("user/fgototp", {
          wrong: "You have entered the wrong otp",
        });
      }
    } catch (err) {
      console.log(err);
      res.redirect("/error");
    }
  };
  const forgotupdate=async(req,res)=>{
    try {
      console.log(req.body);
  let forgoteremail=req.session.forgoteremail
  // await  User.findOneAndUpdate({ email: forgoteremail },{password:req.body.password});
  await User.findOneAndUpdate(
    { email:forgoteremail },
    { $set: {password:req.body.password}}
  );
  res.redirect('/login')
  }
      
    catch (error) {
      console.log(error.message);
    }
  }
  const menudetails=async(req,res)=>{
    try {
      let userSession = req.session.userEmail;
   
     
      await product.find({}, (err, product) => {
      
        if (err) {
          console.log(err);
        } else {
  
          res.render("user/menu", {
            
            data:product,
            sessionData: req.session.userEmail,
           
          });
        }
      });
      
    } catch (error) {
      console.log(error);
    }
  };
  

  async function productSearch(req, res) {

    let searchresult = req.body.searchtext
    console.log("search:" + searchresult);
    await Product.find({name:{$regex:new RegExp(searchresult,'i')}})
    .then((result)=>{
res.render('user/menu', {
        sessionData: req.session.userEmail,
        data: result,
        
    })

    })
    // let productdata = await Product.find({
    //     $or: [
    //         {
    //             item_name: {
    //                 $regex: new RegExp(searchresult),
    //                 $options: 'i'
    //             }
    //         }, {
    //             categoryName: {
    //                 $regex: new RegExp(searchresult),
    //                 $options: 'i'
    //             }
    //         }
    //     ]
    // })
    // let productdata=await Product.find({})
   
    

    


}
  
module.exports = {
  getHome,forgotpassword,forgotupdate,forgototpverify,forgototp,checkCoupon,menudetails,productSearch,
  cancelOrder,
  otpVerification,
  getUserProfile,
  viewOrderProducts,
  getcategorywise,
  getLogin,
  getSignUp,
  postLogin,
  postSignup,
  getLogout,
  postEditProfile,
  getEditProfile,
  postChangePassword,
  getAddAddress,
  changePassword,
  getWishlist,
  orderSuccess,
  getProductDetails,
  getError,
  postAddAddress,
  getCart,
  addToCart,
  removeProduct,
  changeQuantity,
  addToWishlist,
  removewishlistProduct,
  orderDetails,
  getCheckout,
  getabout,
  placeOrder,
  getPay,getSuccess,getCancel,
  categorywise
};
