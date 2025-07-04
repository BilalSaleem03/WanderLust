if(process.env.NODE_ENV != "production"){
    require('dotenv').config()
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");  //npm package for flashing one time messages
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
const dbURL= process.env.ATLASDB_URL;    //mongoDb Atlas URl that connects us with cloud Database
const localDbURL = "mongodb://localhost:27017/WanderLust";  // This URL is to connect With local mongoDB Database...

//Middlewares.........


app.set("view engine" , "ejs");     //This line sets the default view engine for your Express application to EJS (Embedded JavaScript). View engines are used to render dynamic HTML pages based on template files. By setting the view engine to "ejs," Express will automatically look for .ejs files when rendering views. EJS allows you to embed JavaScript code into your HTML, making it easier to create dynamic web pages.The app.set("view engine", "ejs"); line sets EJS as the default view engine, so you don't need to specify the extension when using res.render().


app.set("views" , path.join(path.join(__dirname ,"views"))); //This line specifies the directory where your view templates (EJS files) are located. __dirname is a Node.js variable that refers to the directory of the currently executing script. path.join(__dirname, "views") creates an absolute path to the "views" directory within your project. By setting this, Express knows where to find the EJS files when rendering views.


app.use(express.urlencoded({extended:true}));  //This line is crucial for handling form data that is submitted in URL-encoded format. It parses the incoming request body and makes its data accessible within your Express.js application.
// When a request with URL-encoded form data is received by your Express.js application, the express.urlencoded middleware will:
// Parse the incoming request body.
// Extract the form data.
// Convert the form data into a JavaScript object.
// Attach the parsed object to the req.body property of the request object.


app.use(methodOverride("_method")); // Method Override is a middleware that allows you to use HTTP verbs such as PUT, DELETE, etc., in places where the client doesn't support it (like forms in HTML that only support GET and POST). The "_method" argument indicates that the middleware will look for a query parameter or a hidden input field named _method to override the request method. We also iinstall an npm package "method-override" to use this middleware


app.engine("ejs" , ejsMate); //This line sets up a custom rendering engine for EJS files, using ejsMate. ejsMate is a popular layout and partials manager for EJS that allows you to create layouts (like a base HTML structure) and include partials (reusable pieces of code) within your views. This makes it easier to manage complex views and maintain a consistent layout across your application.We also install npm package "ejs-mate" to use it.


app.use(express.static(path.join(__dirname , "public")));    //This middleware serves static files such as images, CSS files, and JavaScript files from the "public" directory. express.static is a built-in middleware function that allows you to specify a directory where static assets are located. path.join(__dirname, "public") creates an absolute path to the "public" directory. When users request static assets, Express will look in this directory to serve the requested files.



//-----------------------------------------------------------------------------------------------------------------------------------------

//Here in Mongo Store which is a Session Storage for production level code.....
const store = MongoStore.create({
    mongoUrl : localDbURL,
    crypto:{
        secret : process.env.SECRET,
    },
    touchAfter : 24 * 3600,
})

store.on("err" , ()=>{
    console.log("Error in session Store"+err);
})

//------------------------------------------------------------------------------------------------------------------------------------------

//Sessions 
const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {   //make some custome changes in cookies, change expiry
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxAge : 7*24*60*60*1000,
        httpOnly : true
    }
};
app.use(session(sessionOptions));  //create a session(intraction between server and client) . it send cookie havind session id(session id is usedto get information about session that information is stored on server side).  we can make variables in the sessions and perform operations on those variables.if i say req.session.count , a count variable is made in session object . everything about session is stored in memory store(temporary storage) . Its not for production environment. For production level i use mongo Store.

//---------------------------------------------------------------------------------------------------------------------------------------


//for authentitaions using PASSPORT library   
app.use(passport.initialize());
app.use(passport.session());  //to check whether a same user is sending the reques or not
passport.use(new LocalStrategy(User.authenticate()));  //middleware to authenticate users
passport.serializeUser(User.serializeUser());  //store all user related information in session
passport.deserializeUser(User.deserializeUser());  //remove information of user from session


//------------------------------------------------------------------------------------------------------------------------------------------

//flash messages . we can use flash only with sessions
app.use(flash());
app.use((req  , res , next)=>{
    res.locals.success =  req.flash("success");  //we use res.locals to access them in all ejs files
    res.locals.error =  req.flash("error");
    res.locals.currUser =  req.user;
    next();
})


//------------------------------------------------------------------------------------------------------------------------------------------

//connection to Database
async function main(){
    await mongoose.connect(localDbURL)
}
main().then((result)=>{
    console.log("DB Connected");
}).catch((err)=>{console.log(err);})


//-------------------------------------------------------------------------------------------------------------------------------------------

//APi to Search something........
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

//Api related to listing
app.use("/listing" , listingsRouter);
//Api related to Reviews
app.use("/listing/:id/review" , reviewsRouter);
//Api related to User
app.use("/" , userRouter);




//When no above Api handle the get request  , that request is handled by this Api...
app.all("*" ,  (req , res , next)=>{
    next(new MyError(404 , "Page not found."));  //error generated and handled by error middleware(just below) because error was send in next() function.If we do not send error in next() , it will find non error handling middleware
})

//Special type of middleware thathandle errors(Error Middleware i.e manage errors) occurs when no response sent. Mostly execute when request is received on undeclared route.. (400-500 are client side errors status codes and above 500 are server side errors status codes)
app.use((err , re , res , next)=>{
    let{statusCode= 500, message="Some Error Occur."} = err;
    res.render("listing/error.ejs" , {message});
})


//Server runner
app.listen("8080" , ()=>{
    console.log("Server is Running.....")
})