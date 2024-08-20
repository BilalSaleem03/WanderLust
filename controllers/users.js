const User = require("../models/user.js");

module.exports.signupGet = (req ,res)=>{
    res.render("./user/signup.ejs")
}

module.exports.signupPost = async (req ,res)=>{
    try{
        let {username , email , password} = req.body;
        let newUser = new User({username , email});
        let newRegistered = await User.register(newUser , password);
        req.login(newRegistered , (err)=>{
            if(err){
                return next(err);
            }
            req.flash("success" , "welcome to WanderLust");
            res.redirect("/listing");
        })
        
        
    } catch(err){
        req.flash("error" , err.message);
        res.redirect("/signup");
    }
}

module.exports.loginGet = (req ,res)=>{
    res.render("./user/login.ejs")
}

module.exports.loginPost = async(req , res)=>{
    req.flash("success" , "LoggedIn to WanderLust");
    let redirect = res.locals.redirectUrl || "/listing";
    res.redirect(redirect);
}

module.exports.logout = (req ,res)=>{
    req.logOut((err)=>{
        if(err){
            req.flash("error" , err.messgae);
            return res.redirect("/listing");
        }
        req.flash("success" , "LoggedOut Successfully");
        res.redirect("/listing");
    })
}