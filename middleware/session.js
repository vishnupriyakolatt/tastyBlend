const User = require("../model/user/userdetail");
const verifyLoginAdmin = function (req, res) {
  if (req.session.adminId) {
    next();
  } else {
    res.redirect("/admin");
  }
};
const verifyLoginUser = async function (req, res, next) {
  if (req.session.userEmail) {
    let user = await User.findOne({ email: req.session.userEmail });
    if (!user.isBlocked) {
      next();
    } else {
      res.redirect("/login");
    }
  } else {
    res.redirect("/login");
  }
};

const verifyLoginUserWithoutSession = function (req, res, next) {
  if (!req.session.userEmail) {
    next();
  } else {
    res.redirect("/");
  }
};
module.exports = {
  verifyLoginAdmin,
  verifyLoginUser,
  verifyLoginUserWithoutSession,
};
