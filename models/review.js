const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
    rating:{
        type:Number,
        min:1,
        max:5
    },
    comment:String,
    date:{
        type:Date,
        default:Date.now()
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
})

const Review = mongoose.model("Review" , reviewSchema);
module.exports = Review;