var express = require('express');
var router = express.Router();
const upload = require('../config/multer')
const admin=require('../controller/admin')

router.get('/',admin.loginpage)
router.get("/home",admin.adminhome)
router.post("/home",admin.homelogin)
router.get("/logout",admin.adminlogout)


router.get('/userManagement', admin.getUser)
router.get('/blockuser/:id', admin.blockuser)
router.get('/unblockuser/:id', admin.unblockuser)



router.get('/addCategory',admin.getAddCategory)
router.get('/category',admin.getCategory)
router.post('/addCategory', upload.single('image'), admin.insertCategory);
router.get('/editCategory',admin.geteditCategory)
router.post('/editCategory', upload.single('image'), admin.editCategory);
router.get('/updateCategory',admin.updateCategory)

router.get('/product',admin.getProduct)
router.post('/addProduct', upload.array('image',4), admin.insertProduct);
router.get('/addProduct',admin.getAddProduct)
router.get('/statusProduct',admin.statusProduct)
router.get('/editProduct',  admin.editProduct)
router.post('/editProduct', upload.array('image',4), admin.updateProduct);

router.get("/coupons", admin.getCoupons);
router.post("/addCoupon", admin.addCoupon);
router.post("/editCoupon/:id",admin.editCoupon);
router.get('/deleteCoupon/:id', admin.deleteCoupon);

router.get("/orders", admin.orders);
router.post('/changeStatus',  admin.changeStatus);
router.post('/orderCompleted',  admin.orderCompeleted);
router.post('/orderCancel',  admin.orderCancel);
router.get('/salesReport', admin.getSalesReport);

router.get('/banner',  admin.getBanner);
router.get('/addBanner', admin.getAddBanner);
router.post('/addBanner', upload.single('image'),  admin.postAddBanner);
router.get('/deleteBanner/:id',  admin.getDeleteBanner);


module.exports = router;