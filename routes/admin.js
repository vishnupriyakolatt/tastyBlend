var express = require('express');
var router = express.Router();
const upload = require('../config/multer')
const admin=require('../controller/admin')
const sessionMV=require('../middleware/session')

router.get('/',admin.loginpage)
router.get("/home",sessionMV.verifyLoginAdmin,admin.adminhome)
router.post("/home",admin.homelogin)
router.get("/logout",admin.adminlogout)


router.get('/userManagement',sessionMV.verifyLoginAdmin, admin.getUser)
router.get('/blockuser/:id', sessionMV.verifyLoginAdmin,admin.blockuser)
router.get('/unblockuser/:id', admin.unblockuser)



router.get('/addCategory',sessionMV.verifyLoginAdmin,admin.getAddCategory)
router.get('/category',sessionMV.verifyLoginAdmin,admin.getCategory)
router.post('/addCategory',sessionMV.verifyLoginAdmin, upload.single('image'), admin.insertCategory);
router.get('/editCategory',sessionMV.verifyLoginAdmin,admin.geteditCategory)
router.post('/editCategory', sessionMV.verifyLoginAdmin,upload.single('image'), admin.editCategory);
router.patch('/updateCategory',sessionMV.verifyLoginAdmin,admin.updateCategory)

router.get('/product',sessionMV.verifyLoginAdmin,admin.getProduct)
router.post('/addProduct',sessionMV.verifyLoginAdmin, upload.array('image',4), admin.insertProduct);
router.get('/addProduct',sessionMV.verifyLoginAdmin,admin.getAddProduct)
router.get('/statusProduct',sessionMV.verifyLoginAdmin,admin.statusProduct)
router.get('/editProduct',  sessionMV.verifyLoginAdmin,admin.editProduct)
router.post('/editProduct',sessionMV.verifyLoginAdmin, upload.array('image',4), admin.updateProduct);

router.get("/coupons",sessionMV.verifyLoginAdmin, admin.getCoupons);
router.post("/addCoupon", sessionMV.verifyLoginAdmin,admin.addCoupon);
router.post("/editCoupon/:id",sessionMV.verifyLoginAdmin,admin.editCoupon);
router.get('/deleteCoupon/:id', sessionMV.verifyLoginAdmin,admin.deleteCoupon);

router.get("/orders",sessionMV.verifyLoginAdmin, admin.orders);
router.post('/changeStatus', sessionMV.verifyLoginAdmin, admin.changeStatus);
router.post('/orderCompleted',sessionMV.verifyLoginAdmin,  admin.orderCompeleted);
router.post('/orderCancel', sessionMV.verifyLoginAdmin, admin.orderCancel);
router.get('/salesReport', sessionMV.verifyLoginAdmin,admin.getSalesReport);

router.get('/banner',sessionMV.verifyLoginAdmin,  admin.getBanner);
router.get('/addBanner', sessionMV.verifyLoginAdmin,admin.getAddBanner);
router.post('/addBanner', sessionMV.verifyLoginAdmin,upload.single('image'),  admin.postAddBanner);
router.get('/deleteBanner/:id', sessionMV.verifyLoginAdmin, admin.getDeleteBanner);



module.exports = router;