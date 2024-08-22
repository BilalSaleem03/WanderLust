const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    email : {
        type : String,
        required :true
    }
})

userSchema.plugin(passportLocalMongoose);  //automatically generate username and password(implement hashing and salting) fields using passport-local-mongoose package. It also add an authenticate method that automatically authenticate the user

module.exports = mongoose.model("User" , userSchema);