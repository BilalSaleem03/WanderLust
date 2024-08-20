const express = require("express");
const router = express.Router({mergeParams:true});
const Listing = require("../models/listing.js")
const Review = require("../models/review.js")
const wrapAsync = require("../utility/wrapAsync.js");
const {reviewValidation, isLoggedIn, isReviewAuthor}= require("../middlewares.js")

const reviewController = require("../controllers/reviews.js");



//Add new Review
router.post("/" ,reviewValidation,isLoggedIn, wrapAsync(reviewController.addReview));

//delete Review
router.delete("/:reviewId" ,isLoggedIn , isReviewAuthor, wrapAsync(reviewController.deleteReview))

module.exports = router;
