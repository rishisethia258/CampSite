var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");

// INDEX - Show all campgrounds
router.get("/",function(req,res){
	Campground.find({},function(err,allCampgrounds){
		if(err)
			console.log(err);
		else
			res.render("campgrounds/index",{campgrounds: allCampgrounds,currentUser : req.user});		
	});
	
});

// CREATE - Add new campground to Database
router.post("/",isLoggedIn,function(req,res){
	var name = req.body.name;
	var image = req.body.image;
	var description = req.body.description;
	var author = {
		id : req.user._id,
		username : req.user.username
	}
	var newCampground = {name:name ,image:image ,description: description,author:author};
	Campground.create(newCampground,function(err,newlyCreated){
		if(err)
			console.log(err);
		else
			res.redirect("/campgrounds");
	});
});

// NEW - Show form to create new campground
router.get("/new",isLoggedIn,function(req,res){
	res.render("campgrounds/new");
});

// SHOW - Show more info about one campground
router.get("/:id" ,function(req,res) {
	Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampgound){
		if(err) console.log(err);
		else res.render("campgrounds/show",{campground: foundCampgound});
	});
});

// Middleware
function isLoggedIn(req,res,next) {
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}


module.exports = router;