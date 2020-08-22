var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");

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

// EDIT - Show form to Edit Campground
router.get("/:id/edit",checkCampgroundOwnership,function(req,res){
	Campground.findById(req.params.id,function(err,foundCampground){
		if(err) {
			res.redirect("/campgrounds");
		} else {
			res.render("campgrounds/edit",{campground: foundCampground});		
		}
	});
});

// UPDATE - Update Campground
router.put("/:id",checkCampgroundOwnership,function(req,res){
	Campground.findByIdAndUpdate(req.params.id,req.body.camp,function(err,updateCampground){
		if(err) {
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

// DESTROY - Delete Campground
router.delete("/:id", checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndRemove(req.params.id, (err, campgroundRemoved) => {
        if (err) {
            console.log(err);
        }
        Comment.deleteMany( {_id: { $in: campgroundRemoved.comments } }, (err) => {
            if (err) {
                console.log(err);
            }
            res.redirect("/campgrounds");
        });
    })
});


function checkCampgroundOwnership(req,res,next) {
	if(req.isAuthenticated()) {
		Campground.findById(req.params.id,function(err,foundCampground){
			if(err) {
				res.redirect("back");
			} else {
				if(foundCampground.author.id.equals(req.user._id)) {
					next();
				} else {
					res.redirect("back");
				}
			}
		});
	} else {
		res.redirect("back");
	}
}

// Middleware
function isLoggedIn(req,res,next) {
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}


module.exports = router;