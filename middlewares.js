const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const MyError = require("./utility/MyError.js");
const { listingSchema , reviewSchema } = require("./joiValidator.js");


module.exports.isLoggedIn = (req , res , next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        console.log("2222")
        req.flash("error" , "You must be loggedIn");
        return res.redirect("/login");
    }
    next();
} 

module.exports.savedRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner =async (req , res , next)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error" , "You don't have permission for that..");
        return res.redirect(`/listing/${req.params.id}`);
    }
    next();
}

module.exports.listingValidation = (req , res , next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        throw new MyError(500 , "Inpute fields invalid");
    }
    else{
        next();
    }
}

module.exports.reviewValidation = (req , res , next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        throw new MyError(500 , error.message);
    }
    else{
        next();
    }
}

module.exports.isReviewAuthor =async (req , res , next)=>{
    let { id , reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error" , "You don't have permission for that!");
        return res.redirect(`/listing/${id}`);
    }
    next();
}