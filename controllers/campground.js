const Campground = require('../models/campground')
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const mapBoxToken = process.env.MAPBOX_TOKEN
const geoCoder = mbxGeocoding({accessToken:mapBoxToken})

const {cloudinary} = require ("../cloudinary")
const campground = require('../models/campground')

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  }

module.exports.renderNewForm = (req, res) => {
   
    res.render("campgrounds/new");
  }

module.exports.createCampground = async (req, res, next) => {
   const geoData = await geoCoder.forwardGeocode({
      query:req.body.campground.location,
      limit:1,
    }).send()
    //res.send(geoData.body.features[0].geometry.coordinates)
    
    //res.send(req.body);
    //if(!req.body.campground) throw new ExpressError("Invalid Campground Data",400)

    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry
    campground.images = req.files.map(f => ({url:f.path,filename:f.filename}))
    campground.author = req.user._id
    await campground.save();
    console.log(campground)
    req.flash("success","Successfully made a new campground")
    res.redirect(`/campgrounds/${campground._id}`);
  }

module.exports.showCampground = async (req, res) => {
    // console.log("id=>", req.params.id);
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({path:'reviews',populate:{path:'author'}}).populate('author')
   
     if(!campground){
       req.flash('error','Cannot find that campground')
        return res.redirect('/campgrounds')
     }
     // if(!campground.author.equals(req.user._id)){
     //   req.flash("error","YOU DO NOT HAVE A PERMISSION")
     //   return  res.redirect('/campgrounds/${id}')
     // }
      
     //console.log(campground);
     res.render("campgrounds/show", { campground});
   }
   module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;

   const campground = await Campground.findById(id);
   if(!campground){
     req.flash('error','Cannot find that campground')
      return res.redirect('/campgrounds')
   }
   res.render("campgrounds/edit", { campground });
 }

 module.exports.updateCampground = async (req, res) => {
    //res.send("IT Worked")
    const { id } = req.params;
    // const campground=await Campground.findById(id)
    // if(!campground.author.equals(req.user._id)){
    //   req.flash("err","You do not have permission")
    //   return res.redirect(`/campgrounds/${id}`);
    // }
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    const imgs = req.files.map(f => ({url:f.path,filename:f.filename}));
    campground.images.push(...imgs);
    await campground.save()
    if(req.body.deleteImages){
      for(let filename of req.body.deleteImages){
        await cloudinary.uploader.destroy(filename)
      }
      await campground.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}})
    }




    req.flash('success',"Successfully updated campground")
    //console.log(req.body);
    //res.send('PUT!!!!!');
    res.redirect(`/campgrounds/${campground._id}`);
  }

  module.exports.deleteCampground = async (req, res) => {
      
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success',"Successfully deleted campground")
    res.redirect("/campgrounds");
  }