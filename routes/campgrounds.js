const express = require("express");
const router = express.Router();
const catchAsync = require("../utilis/catchAsync");
const ExpressError = require("../utilis/ExpressError");
const Campground = require("../models/campground");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
const campgrounds = require("../controllers/campground");
const multer = require('multer')

const {storage} = require('../cloudinary')
const upload = multer({storage})


// Another way to restructure only same routes
//  router.route('/')
//      .get(catchAsync(campgrounds.index))
// //       .post(isLoggedIn,validateCampground,catchAsync(campgrounds.createCampground));
//     .post(upload.array('image'),(req,res)=>{
//         console.log(req.body,req.files)
//         res.send("IT WOrked")
//     })  

//$$$$$$$  MAKING BASIC INDEX PAGE $$$$$$$$
router.get("/", catchAsync(campgrounds.index));

// $$$$$$$ RENDER A FORM  $$$$$$$$$
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

// $$$$$$$ MAKING A NEW FORM  $$$$$$$$$
router.post("/",isLoggedIn,upload.array('image'),validateCampground,catchAsync(campgrounds.createCampground));

// $$$$$$$$$ SHOW PAGE $$$$$$$$$$$$$$$
router.get("/:id", catchAsync(campgrounds.showCampground));

// $$$$$$$$$$ EDIT FORM $$$$$$$$$$$$$$$$$
router.get( "/:id/edit",isLoggedIn,isAuthor,catchAsync(campgrounds.renderEditForm));

// $$$$$$$$$$ UPDATE FORM $$$$$$$$$$$$$$$$$
router.put("/:id",isLoggedIn,isAuthor,upload.array('image'),validateCampground,catchAsync(campgrounds.updateCampground));

// $$$$$$$$$  DELETE FORM $$$$$$$$$$$$$$$
router.delete("/:id",isLoggedIn,isAuthor,catchAsync(campgrounds.deleteCampground));

module.exports = router;
