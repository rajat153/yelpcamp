
const mongoose = require('mongoose');
const Campground = require('../models/campground')
const cities = require('./cities')
const {places,descriptors} = require('./seedHelpers')
const axios = require('axios')

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser:true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console,"connection error !!"));
db.once("open",() => {
    console.log("Database Connect");
});


async function seedImg() {
    try {
      const resp = await axios.get('https://api.unsplash.com/photos/random', {
        params: {
          client_id:'nOSHXVrmuv8IR8w0OhZBqhCcKYtZtLTfofo6vaHkr8M',
          
          
        },
      })
      return resp.data.urls.small
    } catch (err) {
      console.error(err)
    }
  }



const sample = (array) => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i=0;i<50;i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            location:`${cities[random1000].city},${cities[random1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            image:await seedImg() ,
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui ullam eius quae, molestiae corporis consequuntur amet delectus quis reprehenderit facilis velit, provident commodi optio! Sapiente ullam dolorum deserunt dignissimos pariatur!',
            price
        })
        await camp.save();
    }
    
}
seedDB().then(() => {
    mongoose.connection.close()
})