const mongoose = require("mongoose");
const Review = require('./review.js');

const listingSchema = new mongoose.Schema({
    title:{
        type : String,
        require : true
    },
    description:{
        type : String,
    },
    image:{
        url : String,
        filename : String,
    },
    price:{
        type : Number,
        require : true
    },
    location:{
        type : String,
        require : true
    },
    country:{
        type : String,
        require : true
    },
    reviews:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Review",
    }],
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    geometry :  {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
    }

});

listingSchema.post("findOneAndDelete" , async(listing)=>{
    if(listing){
        await Review.deleteMany({_id : {$in : listing.reviews}});

    }
});

const Listing = mongoose.model("Listing" , listingSchema);

module.exports = Listing; 
