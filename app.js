var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var User = require("./models/user");
var seedDB = require("./seeds");

mongoose.connect('mongodb://localhost:27017/camp_site', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));

seedDB();

// PASSPORT CONFIGURATION:
app.use(require("express-session")({
	secret : "dont under estimate me",
	resave : false,
	saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	next();
});

app.get("/",function(req,res){
	res.render("landing");
});

// INDEX - Show all campgrounds
app.get("/campgrounds",function(req,res){
	Campground.find({},function(err,allCampgrounds){
		if(err)
			console.log(err);
		else
			res.render("campgrounds/index",{campgrounds: allCampgrounds,currentUser : req.user});		
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
	res.render("campgrounds/new");
});

// SHOW - Show more info about one campground
app.get("/campgrounds/:id" ,function(req,res) {
	Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampgound){
		if(err) console.log(err);
		else res.render("campgrounds/show",{campground: foundCampgound});
	});
});

// =================
// COMMENT ROUTES
// =================

app.get("/campgrounds/:id/comments/new",isLoggedIn,function(req,res){
	Campground.findById(req.params.id,function(err,campground){
		if(err)
		{
			console.log(err);
		}
		else
		{
			res.render("comments/new",{campground : campground});		
		}
	});
	
});

app.post("/campgrounds/:id/comments",isLoggedIn,function(req,res){
	Campground.findById(req.params.id,function(err,campground){
		if(err)
		{
			console.log(err);
			res.redirect("/campground");
		}
		else
		{
			Comment.create(req.body.comment,function(err,comment){
				if(err)
				{
					console.log(err);
				}
				else
				{
					campground.comments.push(comment);
					campground.save();
					res.redirect("/campgrounds/" + campground._id);
				}
			});
		}
	});
});

// ===========
// AUTH ROUTES
// ===========

app.get("/register",function(req,res){
	res.render("register");
});
app.post("/register",function(req,res){
	var newUser = new User({username : req.body.username});
	User.register(newUser,req.body.password,function(err,user){
		if(err)
		{
			console.log(err);
			return res.render("register");
		}
		passport.authenticate("local")(req,res,function(){
			res.redirect("/campgrounds");
		});
	});
});

app.get("/login",function(req,res){
	res.render("login");
});
app.post("/login",passport.authenticate("local",
	{
		successRedirect : "/campgrounds",
		failureRedirect : "/login"
	}),function(req,res){
});
app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/campgrounds");
});

function isLoggedIn(req,res,next) {
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}
app.listen(3000,function(){
	console.log("The CampSite Server Started!");
});