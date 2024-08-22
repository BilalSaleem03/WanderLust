const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index = async (req , res , next)=>{
    let allListings = await Listing.find({});
    res.render("listing/index.ejs" , {allListings})
}

module.exports.newListing = (req , res)=>{
    res.render("listing/new.ejs");
}

module.exports.newListingPost = async (req , res , next)=>{
    let responce = await geocodingClient    //will return coordinates of location given
        .forwardGeocode({
            query: req.body.listing.location,
            limit:1,
        })
        .send();

    let url = req.file.path;   //get url and filename to access picture from cloudanary
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing)
    newListing.owner = req.user._id;
    newListing.image = {url , filename};
    newListing.geometry = responce.body.features[0].geometry;
    let savedListing = await newListing.save();
    req.flash("success" , "New Listing Added Successfully");   //creating a flash message..
    res.redirect("/listing");
}

module.exports.showlisting = async (req , res , next)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id).populate({path : "reviews" , populate : {path:"author"}}).populate("owner");
    if(!listing){
        req.flash("error" , "Listing you are accessing does not exist!");
        res.redirect("/listing");
    }
    res.render("listing/show.ejs" , {listing});
}

module.exports.updateListing = async (req , res , next)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error" , "Listing you are accessing does not exist!");
        res.redirect("/listing");
    }
    let orignalurl = listing.image.url;
    orignalurl = orignalurl.replace("/upload" , "/upload/w_250")
    res.render("listing/edit.ejs" , {listing , orignalurl});
}

module.exports.updateListingPut = async (req , res , next)=>{
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id , {...req.body.listing});
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url  , filename};
        await listing.save();
    }
    req.flash("success" , "Listing Updated Successfully");
    res.redirect(`/listing/${req.params.id}`);
}

module.exports.deleteListing = async (req , res , next)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id , {...req.body.listing});
    req.flash("success" , "List Deleted!");
    res.redirect("/listing");
}