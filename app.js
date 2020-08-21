var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Campground = require("./models/campground");
var seedDB = require("./seeds");

mongoose.connect('mongodb://localhost:27017/camp_site', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");

seedDB();

app.get("/",function(req,res){
	res.render("landing");
});

// INDEX - Show all campgrounds
app.get("/campgrounds",function(req,res){
	Campground.find({},function(err,allCampgrounds){
		if(err)
			console.log(err);
		else
			res.render("index",{campgrounds: allCampgrounds});		
	});
	
});

// CREATE - Add new campground to Database
app.post("/campgrounds",function(req,res){
	var name = req.body.name;
	var image = req.body.image;
	var description = req.body.description;
	var newCampground = {name:name ,image:image ,description: description};
	Campground.create(newCampground,function(err,newlyCreated){
		if(err)
			console.log(err);
		else
			res.redirect("/campgrounds");
	});
});

// NEW - Show form to create new campground
app.get("/campgrounds/new",function(req,res){
	res.render("new");
});

// SHOW - Show more info about one campground
app.get("/campgrounds/:id" ,function(req,res) {
	Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampgound){
		if(err) console.log(err);
		else res.render("show",{campground: foundCampgound});
	});
})

app.listen(3000,function(){
	console.log("The CampSite Server Started!");
});