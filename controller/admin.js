const User = require("../model/user/userdetail");
var Product = require("../model/admin/product");
const Order = require("../model/user/order");
const Category = require("../model/admin/category");
const Banners = require("../model/admin/banner");
const Carts = require("../model/user/cart");
const coupon = require("../model/admin/coupon");
const dotenv = require("dotenv");

const upload = require("../config/multer");
const { text } = require("express");
dotenv.config();

const moment = require("moment");
const { order } = require("paypal-rest-sdk");
const loginpage = (req, res) => {
  res.render("admin/adminlogin");
};

const user = {
  email: "admin@gmail.com",
  passwd: "1234",
};

const adminhome = async (req, res) => {
  let amt = 0;
  try {
    const orderData = await Order.find({});

    const userDetail = await User.find({});

    const productnumber = await Product.find({});

    if (orderData && userDetail && productnumber) {
      console.log(orderData + "gr" + productnumber + "gr" + userDetail);
      const totalAmount = orderData.reduce((accumulator, object) => {
        return (accumulator += object.finalAmount);
      }, 0);
  
      let codamount=0
     let paypalamount=0
      
      if(orderData){
          
          for(let i=0;i<orderData.length;i++){
           
              if(orderData[i].paymentMethod==="COD"){
                codamount=codamount+orderData[i].finalAmount
                 
              }else{
                paypalamount=paypalamount+orderData[i].finalAmount
                 
              }

          }
         console.log("total amount of cod is"+codamount);
         console.log("total amount of paypal"+paypalamount);

      }
      const orderToday = await Order.find({
        orderStatus: { $ne: "Cancelled" },
        order_placed_on: moment().format('DD-MM-YYYY'),
    });
    const totalOrderToday = orderToday.reduce((accumulator, object) => {
        return (accumulator += object.totalAmount);
    }, 0);

    const start = moment().startOf("month");
    const end = moment().endOf("month");
    const amountPendingList = await Order.find({
        orderStatus: { $ne: "Cancelled" },
        createdAt: {
            $gte: start,
            $lte: end,
        },
    });
    const amountPending = amountPendingList.reduce(
        (accumulator, object) => {
            return (accumulator += object.totalAmount);
        },
        0
    );
      const pendingOrder = await Order.find({ orderStatus: "Pending" });
      const pending = pendingOrder.length;
      const processingOrder = await Order.find({ orderStatus: "Shipped" });
      const processing = processingOrder.length;
      console.log("pending details are here"+pending);
      const deliveredOrder = await Order.find({ orderStatus: "Delivered" });
      const delivered = deliveredOrder.length;
      const cancelledOrder = await Order.find({ orderStatus: "Cancelled" });
      const cancelled = cancelledOrder.length;
      res.render("admin/adminhome", {
        orderData,
        userDetail,
        productnumber, pending,totalOrderToday,amountPending,
        processing,
        delivered,codamount,paypalamount,
        cancelled,
        totalAmount,
      });
    }
  } catch (error) {}
};

function homelogin(req, res) {
  let adminEmail = "admin@gmail.com";
  let adminpassword = "1234";
  if (req.body.email === adminEmail && req.body.password === adminpassword) {
    res.redirect("/admin/home");
  } else {
    res.render("admin/adminlogin", { wrong: "invalid Username or Password" });
  }
}

function adminlogout(req, res) {
  res.redirect("/admin");
}

//USER MANAGEMENT STARTS FROM HERE
const getUser = (req, res) => {
  try {
    User.find({}, (err, allUsers) => {
      if (err) {
        console.log(err);
      } else {
        res.render("admin/userDetails", { data: allUsers });
      }
    });
  } catch (error) {
    console.log(error);
  }
};
const blockuser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: { isBlocked: true } }
    ).then(() => {
      console.log(req.params.id);
      res.redirect("/admin/userManagement");
    });
  } catch (error) {
    console.log(error.message);
  }
};
const unblockuser = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.params.id },
      { $set: { isBlocked: false } }
    ).then(() => {
      res.redirect("/admin/userManagement");
    });
  } catch (error) {
    console.log(error.message);
  }
};
//CATEGORY MANAGEMENT HERE
const getAddCategory = (req, res) => {
  res.render("admin/addCategory");
};
const insertCategory = async (req, res) => {
  try {
    const categoryData = req.body.name.toLowerCase();
    const allCategories = await Category.find();
    const verify = await Category.findOne({ name: categoryData });
    // let category = new Category({
    //     name: req.body.name,
    //     image: req.file.filename,
    // })
    // category.save();
    // res.redirect('/admin/category');
    if (verify == null) {
      const newCategory = new Category({
        name: req.body.name,
        image: req.file.filename,
      });
      newCategory.save().then(() => {
        res.redirect("/admin/category");
      });
    } else {
      res.render("admin/addCategory", {
        wrong: "category already exists",
        allCategories,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const getCategory = async (req, res) => {
  try {
    Category.find({}, (err, categoryDetails) => {
      if (err) {
        console.log(err);
      } else {
        console.log(categoryDetails);
        res.render("admin/category", { details: categoryDetails });
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};
const geteditCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await Category.findById({ _id: id });
    if (userData) {
      res.render("admin/editCategory", { user: userData });
    } else {
      res.redirect("/admin/category");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const editCategory = async (req, res) => {
  try {
    const id = req.query.id;
    await Category.findByIdAndUpdate(
      { _id: id },
      { $set: { name: req.body.name, image: req.file.filename } }
    );

    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};
const updateCategory = async (req, res) => {
  try {
    const check = await Category.findById({ _id: req.query.id });

    if (check.status == true) {
      await Category.findByIdAndUpdate(
        { _id: req.query.id },
        { $set: { status: false } }
      );
      console.log(check.status);
    } else {
      await Category.findByIdAndUpdate(
        { _id: req.query.id },
        { $set: { status: true } }
      );
      console.log(check.status);
    }
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};

//PRODUCT MANAGEMENT STARTS FROM HERE
const getAddProduct = async (req, res) => {
  try {
    Category.find({}, (err, categorydetails) => {
      if (err) {
        console.log(err);
      } else {
        res.render("admin/addProduct", { user: categorydetails });
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};
const insertProduct = async (req, res) => {
  try {
    const image = [req.files[0], req.files[1], req.files[2], req.files[3]];
    console.log(image);
    
    let product = new Product({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      image: req.files,

      price: req.body.price,
      quantity: req.body.quantity,
    });
    console.log(req.files);
    await product.save();
    res.redirect("/admin/product");
  } catch (error) {
    console.log(error.message);
  }
};
const getProduct = async (req, res) => {
  try {
    Product.find({}, (err, productDetails) => {
      if (err) {
        console.log(err);
      } else {
        res.render("admin/product", { details: productDetails });
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

const statusProduct = async (req, res) => {
  try {
    const check = await Product.findById({ _id: req.query.id });

    if (check.status == true) {
      await Product.findByIdAndUpdate(
        { _id: req.query.id },
        { $set: { status: false } }
      );
      console.log(check.status);
    } else {
      await Product.findByIdAndUpdate(
        { _id: req.query.id },
        { $set: { status: true } }
      );
      console.log(check.status);
    }
    res.redirect("/admin/product");
  } catch (error) {
    console.log(error.message);
  }
};
const editProduct = async (req, res) => {
  try {
    const id = req.query.id;

    const product = await Product.findOne({ _id: id });
    const categoryDetails = await Category.find();
    if (product) {
      res.render("admin/editProduct", { product, category: categoryDetails });
    } else {
      res.redirect("/admin/product");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const updateProduct = async (req, res) => {
  console.log(req.files);
  if (req.files[0]) {
    console.log("with images");
    await Product.findByIdAndUpdate(
      { _id: req.query.id },
      {
        $set: {
          name: req.body.name,
          description: req.body.description,
          category: req.body.category,
          image: req.files,
          price: req.body.price,
          quantity: req.body.quantity,
          color: req.body.color,
        },
      }
    );
  } else {
    console.log("no image");
    await Product.findByIdAndUpdate(
      { _id: req.query.id },
      {
        $set: {
          name: req.body.name,
          description: req.body.description,
          category: req.body.category,
          price: req.body.price,
          quantity: req.body.quantity,
          color: req.body.color,
        },
      }
    );
  }
  res.redirect("/admin/product");
};

const orders = async (req, res) => {
  try {
    const orderDetails = await Order.find()
      .populate("address")
      .populate({ path: "products.productId", select: "name price" })
      .populate({ path: "user_id", select: "firstName" });
    console.log(orderDetails[0]);
    res.render("admin/orders", { orderDetails });
  } catch {
    console.error();
    res.render("user/error");
  }
};
const changeStatus = async (req, res) => {
  try {
    const { orderID, paymentStatus, orderStatus } = req.body;
    Order.updateOne(
      { _id: orderID },
      {
        paymentStatus,
        orderStatus,
      }
    )
      .then(() => {
        res.send("success");
      })
      .catch(() => {
        res.redirect("/500");
      });
  } catch (error) {
    res.redirect("/500");
  }
};
const orderCompeleted = (req, res) => {
  try {
    const { orderID } = req.body;
    Order.updateOne({ _id: orderID }, { orderStatus: "Completed" }).then(() => {
      res.send("done");
    });
  } catch (error) {
    res.redirect("/500");
  }
};
const orderCancel = (req, res) => {
  try {
    const { orderID } = req.body;
    Order.updateOne(
      { _id: orderID },
      { orderStatus: "Cancelled", paymentStatus: "Cancelled" }
    ).then(() => {
      res.send("done");
    });
  } catch (error) {
    res.redirect("/500");
  }
};
const getBanner = async (req, res) => {
  try {
    Banners.find({}, (err, BannerDetails) => {
      if (err) {
        console.log(err);
      } else {
        res.render("admin/banner", { banner: BannerDetails });
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};
const getAddBanner = (req, res) => {
  res.render("admin/addBanner");
};
const postAddBanner = async (req, res) => {
  try {
    let banner = new Banners({
      name: req.body.name,

      image: req.file.filename,

      text: req.body.description,
    });
    await banner.save();
    res.redirect("/admin/banner");
  } catch (error) {
    console.log(error.message);
  }
};

const getDeleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    await Banners.deleteOne({ _id: id }).then(() => {
      res.redirect("/admin/banner");
    });
  } catch (error) {
    console.log(error.message);
  }
};
const getSalesReport = async (req, res) => {
  try {
    const today = moment().startOf("day");
    const endtoday = moment().endOf("day");
    const monthstart = moment().startOf("month");
    const monthend = moment().endOf("month");
    const yearstart = moment().startOf("year");
    const yearend = moment().endOf("year");
    const daliyReport = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: today.toDate(),
            $lte: endtoday.toDate(),
          },
        },
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },

      {
        $project: {
          order_id: 1,
          user: 1,
          paymentStatus: 1,
          totalAmount: 1,
          orderStatus: 1,
        },
      },
      {
        $unwind: "$user",
      },
    ]);
    console.log(daliyReport);
    const monthReport = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: monthstart.toDate(),
            $lte: monthend.toDate(),
          },
        },
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },

      {
        $project: {
          order_id: 1,
          user: 1,
          paymentStatus: 1,
          totalAmount: 1,
          orderStatus: 1,
        },
      },
      {
        $unwind: "$user",
      },
    ]);
    console.log(monthReport);
    const yearReport = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: yearstart.toDate(),
            $lte: yearend.toDate(),
          },
        },
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $project: {
          order_id: 1,
          user: 1,
          paymentStatus: 1,
          totalAmount: 1,
          orderStatus: 1,
        },
      },
      {
        $unwind: "$user",
      },
    ]);
    res.render("admin/salesReport", {
      today: daliyReport,
      month: monthReport,
      year: yearReport,
    });
  } catch (error) {
    console.log(error);
  }
};
const getCoupons = (req, res) => {
  try {
    coupon.find().then((coupons) => {
      res.render("admin/coupons", { coupons });
    });
  } catch {
    console.error();
  }
};
const addCoupon = (req, res) => {
  try {
    const data = req.body;
    const dis = parseInt(data.discount);
    const max = parseInt(data.max);
    const discount = dis / 100;
    const coupenadd = new coupon({});
    coupon
      .create({
        couponName: data.coupon,
        discount: discount,
        maxLimit: max,
        expirationTime: data.exdate,
      })
      .then(() => {
        res.redirect("/admin/coupons");
      });
  } catch {
    console.error();
  }
};
const editCoupon = (req, res) => {
  try {
    const id = req.params.id;
    const cName = req.body.coupon.toUpperCase();
    const data = req.body;
    coupon
      .updateOne(
        { _id: id },
        {
          couponName: cName,
          discount: data.discount / 100,
          maxLimit: data.max,
          expirationTime: data.exdate,
        }
      )
      .then(() => {
        res.redirect("/admin/coupons");
      });
  } catch {
    console.error();
  }
};
const deleteCoupon = (req, res) => {
  const id = req.params.id;
  coupon.deleteOne({ _id: id }).then(() => {
    res.redirect("/admin/coupons");
  });
};

module.exports = {
  loginpage,
  adminhome,
  homelogin,
  adminlogout,
  getUser,
  blockuser,
  unblockuser,
  updateProduct,
  editProduct,
  statusProduct,
  insertProduct,
  getProduct,
  getAddProduct,
  getAddCategory,
  insertCategory,
  getCategory,
  editCategory,
  updateCategory,
  geteditCategory,
  orderCancel,
  orderCompeleted,
  changeStatus,
  orders,
  getDeleteBanner,
  postAddBanner,
  getAddBanner,
  getBanner,
  getSalesReport,
  deleteCoupon,
  editCoupon,
  addCoupon,
  getCoupons,
};
