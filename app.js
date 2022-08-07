if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}
// require('dotenv').config();
// console.log(process.env.SECRET)

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require('express-session')
const flash = require('connect-flash')
const ExpressError = require("./utilis/ExpressError");
const methodOverride = require("method-override");
const passport = require('passport')
const LocalStrategy = require("passport-local")
const User = require('./models/user')
const mongoSanitize = require("express-mongo-sanitize")
const helmet = require('helmet')
const userRoutes = require('./routes/users')
const campgroundsRoutes = require("./routes/campgrounds")
const reviewsRoutes = require("./routes/reviews");
const MongoStore = require('connect-mongo');
//const MongoDBStore = require('connect-mongo')
// process.env.DB_URL
//const catchAsync = require("./utilis/catchAsync");
//const Joi = require("joi");
//const { campgroundSchema,reviewSchema } = require("./schemas.js");
//const Campground = require("./models/campground");
//const { valid } = require("joi");
//const campground = require("./models/campground");
//const Review =  require("./models/review")

// "mongodb://localhost:27017/yelp-camp"
const dbUrl = "mongodb://localhost:27017/yelp-camp"

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  //useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error !!"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true })); /// for parse the req.body
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"public")))
app.use(mongoSanitize())


const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
      secret: 'squirrel'
  }
});

store.on("error",function(e){
  console.log("Session Store error",e)
})


const sessionConfig ={
  store,
  name:'session',
  secret:"thisissecret",
  resave:false,
  saveUninitialized:true,
  cookie:{
    httpOnly:true,
    expires:Date.now()+ 1000*60*60*24*7,
    maxAge:1000*60*60*24*7
  }
}
app.use(session(sessionConfig))
app.use(flash())
app.use(helmet())


const scriptSrcUrls = [
 
  'https://stackpath.bootstrapcdn.com/',
  'https://api.tiles.mapbox.com/',
  'https://api.mapbox.com/',
  'https://kit.fontawesome.com/',
  'https://cdnjs.cloudflare.com/',
  'https://cdn.jsdelivr.net/'
];
const styleSrcUrls = [
  'https://kit-free.fontawesome.com/',
  'https://stackpath.bootstrapcdn.com/',
  'https://api.mapbox.com/',
  'https://api.tiles.mapbox.com/',
  'https://fonts.googleapis.com/',
  'https://use.fontawesome.com/',
  'https://cdn.jsdelivr.net/'  // I had to add this item to the array 
];
const connectSrcUrls = [
  'https://api.mapbox.com/',
  'https://a.tiles.mapbox.com/',
  'https://b.tiles.mapbox.com/',
  'https://events.mapbox.com/'
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: [
        "'self'",
        'blob:',  
        'data:',
        'https://res.cloudinary.com/rajat153/', //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        'https://images.unsplash.com/',
        'https://i.picsum.photo'
      ],
      fontSrc: ["'self'", ...fontSrcUrls]
    }
  })
);
 

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))


passport.serializeUser(User.serializeUser()) //How to store it or un-store it in session
passport.deserializeUser(User.deserializeUser())


app.use((req,res,next)=>{
  console.log(req.session)
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  next()

})

// app.get('/fakeuser',async(req,res)=>{
//   const user = new User({email:'colt@gamil.com',username:"coltt"})
//   const newUser = await User.register(user,"chicken") //register takes whole user model and password and hash it
//   res.send(newUser)

// })


app.use('/campgrounds',campgroundsRoutes)
app.use('/campgrounds/:id/reviews',reviewsRoutes)
app.use('/',userRoutes)



// app.get("/makecampground",async(req,res) => {
//    //res.send("hello from yelpCamp")
//    //res.render('home')
//   const camp = new Campground({title: 'My Backyard',description:'cheap camping'})
//   await camp.save()
//   res.send(camp)
// })


app.get("/", (req, res) => {
  //res.send("hello from YElp")
  res.render("home");
});


app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
  // res.send("404!!!")
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No,Something went wrong";
  res.status(statusCode).render("error", { err });
  // res.send("OH BOY,SOMETHING WENT WRONG")
});

app.listen(3000, () => {
  console.log("Serving on port 3000");
});
