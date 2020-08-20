var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/camp_site', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");

var campgroundSchema = new mongoose.Schema({
	name : String,
	image : String
});

var Campground = mongoose.model("Campground",campgroundSchema);

// Campground.create(
// 	{
// 		name: "Granite Hill",
// 		image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"
// 	}, 
// 	function(err,campground) {
// 		if(err)
// 		{
// 			console.log(err);
// 		}
// 		else
// 		{
// 			console.log("NEWLY CREATED CAMPGROUND");
// 			console.log(campground);
// 		}
// 	});

app.get("/",function(req,res){
	res.render("landing");
});

app.get("/campgrounds",function(req,res){
	Campground.find({},function(err,allCampgrounds){
		if(err)
			console.log(err);
		else
			res.render("campgrounds",{campgrounds: allCampgrounds});		
	});
	
});

app.post("/campgrounds",function(req,res){
	var name = req.body.name;
	var image = req.body.image;
	var newCampground = {name:name ,image:image};
	Campground.create(newCampground,function(err,newlyCreated){
		if(err)
			console.log(err);
		else
			res.redirect("/campgrounds");
	});
});

app.get("/campgrounds/new",function(req,res){
	res.render("new");
});

app.listen(3000,function(){
	console.log("The CampSite Server Started!");
});