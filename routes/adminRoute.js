const express = require("express");
const route = express.Router();
const userModel = require("../models/adminModel");
const movieModel = require("../models/movieModel");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
//authMiddleware
const authMiddleware = require("../auth/authMiddleware");

//GET /login
route.get("/login", async (req, res) => {
  try {
    const locals = {
      login: "Already have an account?",
      register: "Don't have an account?",
    };
    res.render("admin/login", { locals });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
});

//POST /login
route.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await userModel.findOne({ username });
    if (!user) {
      return res.json({ success: false, message: "Invalid username" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.json({ success: false, message: "Invalid password" });
    }
    //res.json({success: true, user})
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token);
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
});

//POST /register
route.post("/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (
      username.trim() === "" ||
      password.trim() === "" ||
      email.trim() === ""
    ) {
      return res.json({
        success: false,
        message: "Please fill in all the fields",
      });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid email format" });
    }

    if (!validator.isStrongPassword(password)) {
      return res.json({ success: false, message: "Invalid password format" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const data = await userModel.create({
      username,
      password: hashedPassword,
      email,
    });
    res.redirect('/login')
  } catch (error) {
    if (error.code === 11000) {
      return res.json({ success: false, message: "User already exists" });
    }
    res.json({ success: false, message: "Server Error" });
  }
});

//GET /dashboard
route.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // Get userId  from the req as set by authMiddleware
    const userData = await userModel.findById(userId);
    const movieData = await movieModel.find().sort({ updatedAt: -1 });
    const locals = {
      title: "Welcome to your Dashboard",
      description: "Here, you can add, edit or delete your movies.",
    };

    ///if no user is found, redirect to the login page:
    if (!userData) {
      return res.redirect("/login");
    }
    res.render("admin/dashboard", { locals, userData, movieData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
});

//GET /add-new
route.get("/add-new", authMiddleware, async (req, res) => {
  try {
    res.render("admin/add-new");
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
});

//POST /add-new
route.post("/add-new", authMiddleware, async (req, res) => {
  try {
    const { title, genre, year, rating, status, description } = req.body;
    const userId = req.userId; //get the user's ID from the request.
    const data = await movieModel.create({
      title,
      genre,
      year,
      rating,
      status,
      description,
      userId, //link movie to the user
    });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
});

//GET edit-movie/:id
route.get("/edit-movie/:id", authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const movie = await movieModel.findById({ _id: id });
    res.render("admin/edit-movie", { movie });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
});

//PUT edit-movie/:id
route.put("/edit-movie/:id", authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    await movieModel.findByIdAndUpdate(id, {
      title: req.body.title,
      genre: req.body.genre,
      year: req.body.year,
      rating: req.body.rating,
      status: req.body.status,
      description: req.body.description,
      updatedAt: Date.now(),
    });

    res.redirect(`/edit-movie/${id}`); 
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
});

//DELETE delete-movie/:id
route.delete('/delete-movie/:id', authMiddleware, async(req, res) => {
  try {
    const id = req.params.id;
    await movieModel.deleteOne({_id: id});
    res.redirect('/dashboard')
    
  } catch (error) {
    console.log(error);
    res.json({success: false, message: "Error"});
  }
})

//GET /logout
route.get('/logout', authMiddleware, (req, res) => {
  res.clearCookie('token');
  res.redirect("/login")
})

module.exports = route;
