const express = require("express");
const router = express.Router();   //our express has that router method
const wrapAsync = require("../utility/wrapAsync.js")
const {isLoggedIn, isOwner , listingValidation} = require("../middlewares.js");
const {storage} = require("../cloudanaryConfg.js")
const multer  = require('multer')     //use as middleware to parse multipart/formdata
const upload = multer({ storage })     //store file in cloud
const listingControllers = require("../controllers/listings.js");


router.route("/")
    .get(wrapAsync(listingControllers.index))
    .post(isLoggedIn ,upload.single('listing[image]'), listingValidation ,wrapAsync(listingControllers.newListingPost));

//new listing
router.get("/new" ,isLoggedIn ,  listingControllers.newListing)

//Update
router.get("/:id/edit" ,isLoggedIn , isOwner , wrapAsync(listingControllers.updateListing))



router.route("/:id")
    .get(wrapAsync(listingControllers.showlisting))
    .put(isLoggedIn , isOwner , upload.single('listing[image]'), listingValidation , wrapAsync(listingControllers.updateListingPut))
    .delete( isLoggedIn , isOwner ,wrapAsync(listingControllers.deleteListing))



module.exports = router;