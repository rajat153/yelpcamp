const Campground = require('../models/campground')
const Review = require('../models/review')


module.exports.createReview = async(req,res)=>{
    //res.send("You MADE IT ")
   const campground =  await Campground.findById(req.params.id)
   const review = new Review(req.body.review)
   review.author = req.user._id;
   campground.reviews.push(review);
   await  review.save();
   await campground.save()
   req.flash('success',"new review created")
   res.redirect(`/campgrounds/${campground._id}`)
  
  }

  // eslint-disable-next-line no-undef
  module.exports.deleteReview = async(req,res)=>{
    //res.send("DELETE")
    const {id,reviewId} = req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
    await Review.findByIdAndDelete(reviewId)
    req.flash('success',"Successfully deleted review")

    res.redirect(`/campgrounds/${id}`)
  }