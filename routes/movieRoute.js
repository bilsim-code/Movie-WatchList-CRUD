const express = require("express");
const route = express.Router();
const movieModel = require("../models/movieModel");

//GET home
route.get("/", async (req, res) => {
  try {
    const locals = {
      title: "My Movies",
      description:
        "Recommended movies based on other users.To add your own movies, please Login or Signup.",
    };

    const page = parseInt(req.query.page) || 1;
    const perPage = 10;
    const offset = (page - 1) * perPage;

    const data = await movieModel.find().sort({rating: -1}).limit(perPage).skip(offset).exec();

    const totalItems = await movieModel.countDocuments();
    const totalPages = Math.ceil(totalItems / perPage);
    const nextPage = page + 1;
    const hasNextPage = page < totalPages;
    res.render("main/index", { locals, data, nextPage: hasNextPage ? nextPage : 1 });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "ERROR" });
  }
});

//GET /movie/:id
route.get("/movie/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = await movieModel.findById({ _id: id });

    res.render("main/movie", { data });
  } catch (error) {
    console.log(error);
    res.json({ success: true, message: "Error" });
  }
});

//GET /search

module.exports = route;
