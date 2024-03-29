const { campgroundSchema } = require("./schemas.js");
const ExpressError = require("./utilis/ExpressError");
const Campground = require("./models/campground");
const {reviewSchema } = require("./schemas.js");
const Review = require('./models/review')


module.exports.isLoggedIn = (req,res,next)=>{
  console.log("REQ USER",req.user)
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl
        console.log(req.path,req.originalUrl)
        req.flash('error','you must be signed in')
        return res.redirect('/login')
      }
      next();
}


module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(".");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// app.get("/makecampground",async(req,res)=>{
//   const camp = new Campground({title:"MY BACKYARD",description :"cheap campaigning"})
//   await camp.save()
//   res.send(camp)

// })


module.exports.isAuthor =  async(req,res,next)=>{
  const {id} = req.params;
  const campground = await Campground.findById(id)
  if(!campground.author.equals(req.user._id)){
    req.flash("error","YOU DO NOT HAVE A PERMISSION")
    return  res.redirect('/campgrounds/${id}')
  }
  next();

}

module.exports.isReviewAuthor =  async(req,res,next)=>{
  const {id,reviewId} = req.params;
  const review = await Review.findById(reviewId)
  if(!review.author.equals(req.user._id)){
    req.flash("error","YOU DO NOT HAVE A PERMISSION")
    return res.redirect('/campgrounds/${id}')
  }
  next();

}

module.exports.validateReview=(req,res,next)=>{
  const {error} = reviewSchema.validate(req.body)
  if (error) {
    const msg = error.details.map((el) => el.message).join(".");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
  
}