if(process.env.NODE_ENV != "production"){
    require('dotenv').config()
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js")
const MyError = require("./utility/MyError.js")
const path = require("path");
const ejsMate = require("ejs-mate");
const listingsRouter = require("./routes/listing.js")
const reviewsRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js")
const Listing = require("./models/listing.js")
const dbURL= process.env.ATLASDB_URL;

app.set("view engine" , "ejs");
app.set("views" , path.join(path.join(__dirname ,"views")));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs" , ejsMate);
app.use(express.static(path.join(__dirname , "public")));

const store = MongoStore.create({
    mongoUrl : dbURL,
    crypto:{
        secret : process.env.SECRET,
    },
    touchAfter : 24 * 3600,
})

store.on("err" , ()=>{
    console.log("Error in session Store"+err);
})

const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxAge : 7*24*60*60*1000,
        httpOnly : true
    }
};



app.use(session(sessionOptions));
app.use(flash());

//for authentitaions
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req  , res , next)=>{
    res.locals.success =  req.flash("success");
    res.locals.error =  req.flash("error");
    res.locals.currUser =  req.user;
    next();
})

async function main(){
    await mongoose.connect(dbURL)
}
main().then((result)=>{
    console.log("DB Connected");
}).catch((err)=>{console.log(err);})

//Search APi
app.post("/search" , async(req , res)=>{
    let userInpute = req.body.search;
    let allListings = await Listing.find({});
    let filteredListings =[];
    for(let listing of allListings){
        if(listing.title.includes(userInpute) ||listing.location.includes(userInpute) || listing.country.includes(userInpute) ){  
            filteredListings.push(listing);
        }
    }
    if(filteredListings.length === 0){
        req.flash("error" , "No such Listing Exists");
        res.redirect("/listing");
    } else{
        res.render("listing/search.ejs" , {filteredListings})
    }
    
})

app.use("/listing" , listingsRouter);
app.use("/listing/:id/review" , reviewsRouter);
app.use("/" , userRouter);

app.get("/demouser" ,async (req , res)=>{
    let fakeUser = new User({
        email:"bilal@gmail.com",
        username:"_bilal_",
    }) 
    let newUser =await User.register(fakeUser , "Hello");
    res.send(newUser);
})

app.all("*" ,  (req , res , next)=>{  //for non-declared routs
    next(new MyError(500 , "Error is there"));
})

app.use((err , re , res , next)=>{
    let{statusCode= 500, message="Something went Wrong"} = err;
    res.render("listing/error.ejs" , {message});
})

app.listen("3000" , ()=>{
    console.log("Server is Running.....")
})