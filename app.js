const express = require('express')
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override');
const Campground = require('./models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser:true,
    // useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error !!"));
db.once("open",() => {
    console.log("Database connected")
});

const app = express();

app.engine('ejs',ejsMate)
app.set('views', path.join(__dirname,'views'))
app.set('view engine','ejs');

app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'));
// app.get("/makecampground",async(req,res) => {
//    //res.send("hello from yelpCamp")
//    //res.render('home')
//   const camp = new Campground({title: 'My Backyard',description:'cheap camping'})
//   await camp.save()
//   res.send(camp)
// })

app.get('/',(req,res) => {
    res.render('home')
})
app.get('/campgrounds', async(req,res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds})
})
app.get('/campgrounds/new', (req,res)=>{
    res.render('campgrounds/new');
})

app.post('/campgrounds', async(req,res)=>{
    //res.send(req.body);
    const campground =new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
})

app.get('/campgrounds/:id', async(req,res) =>{
    console.log('id=>', req.params.id);
    const campground = await Campground.findById(req.params.id)
    //console.log(campground);
    res.render('campgrounds/show',{campground});
})

app.get('/campgrounds/:id/edit', async (req, res) => {
    // const { id } = req.params;
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {campground})
})

app.put('/campgrounds/:id',async(req,res) =>{
    //res.send("IT Worked")
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});
  //console.log(req.body);
  //res.send('PUT!!!!!');
    res.redirect(`/campgrounds/${campground._id}`);
})

app.delete('/campgrounds/:id',async(req,res) =>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');

})
app.listen(3000,() => {
    console.log('Serving on port 3000')
})