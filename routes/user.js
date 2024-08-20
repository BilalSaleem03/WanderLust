const express = require("express");
const User = require("../models/user.js");
const wrapAsync = require("../utility/wrapAsync");
const passport = require("passport");
const { savedRedirectUrl } = require("../middlewares.js");
const router = express.Router();
const userControllers = require("../controllers/users.js")


//signUp
router.route("/signup")
    .get(userControllers.signupGet)
    .post(wrapAsync(userControllers.signupPost))


//logIn
router.route("/login")
    .get(userControllers.loginGet)
    .post(savedRedirectUrl, passport.authenticate("local" , {failureRedirect:"/login" , failureFlash:true}) , userControllers.loginPost)


//logOut
router.get("/logout" , userControllers.logout)

module.exports =router;