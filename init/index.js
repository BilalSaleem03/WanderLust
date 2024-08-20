const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/WanderLust")
}
main().then((result)=>{
    console.log("DB Connected");
}).catch((err)=>{console.log(err);})

async function insertData(){
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj , owner : "66b7e84a35ba3d1968903e32"}));
    await Listing.insertMany(initData.data);
    console.log("Inserted")
}
insertData();