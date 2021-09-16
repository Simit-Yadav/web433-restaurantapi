/*********************************************************************************
 * WEB422 – Assignment 1
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy.
 * No part of this assignment has been copied manually or electronically from any other source
 * (including web sites) or distributed to other students.
 *
 * Name: _____Simit Sanjay Yadav__________ Student ID: ___151009198_____ Date: ____15-09-2021____
 * Heroku Link: _______________________________________________________________
 *
 ********************************************************************************/

const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
// const restaurants = require("./routes/restaurants");
const HTTP_PORT = process.env.PORT | 8080;
const RestaurantDB = require("./modules/restaurantDB.js");
const { query, validationResult } = require("express-validator");
const db = new RestaurantDB();

dotenv.config({ path: "./config.env" });

const getRestaurants = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      throw new Error(
        "Query params(page,perPage) must be a number and are required"
      );
    }
    const { page, perPage, borough } = req.query;
    const resp = await db.getAllRestaurants(page, perPage, borough);
    res.status(200).json(resp);
  } catch (err) {
    console.log("Something went wrong.." + err);
    res.status(400).json({ msg: err.message });
  }
};

const getRestaurant = async (req, res) => {
  const id = req.params.id;
  try {
    const resp = await db.getRestaurantById(id);
    if (resp == null) {
      throw new Error("No restaurant with this ID try again.");
    }
    res.status(200).json(resp);
  } catch (err) {
    console.log("Something went wrong.." + err);
    res.status(400).json({ msg: err.message });
  }
};

const saveRestaurant = async (req, res) => {
  try {
    console.log(req.body);
    const data = db.addNewRestaurant(req.body);
    res.status(200).json({ msg: "Restaurant Saved Successfully to database." });
  } catch (err) {
    console.log("Something went wrong.." + err);
    res.status(400).json({ msg: err.message });
  }
};

const updateRestaurant = async (req, res) => {
  const id = req.params.id;
  try {
    const resp = await db.updateRestaurantById(req.body, id);
    res.status(200).json({ msg: "Restaurant updated successfully." });
  } catch (error) {
    console.log("Something went wrong.." + err);
    res.status(400).json({ msg: err.message });
  }
};

const deleteRestaurant = async (req, res) => {
  const id = req.params.id;
  try {
    const resp = await db.deleteRestaurantById(id);
    if (resp.deletedCount == 0) {
      throw new Error("Restaurant with this ID doesn't exist. Try again.");
    }
    res.status(200).json({ msg: "Restaurant Successfully Deleted" });
  } catch (err) {
    console.log("Something went wrong.." + err);
    res.status(400).json({ msg: err.message });
  }
};

app.use(cors());
app.use(express.json());
// app.use("/api/restaurants",);
app
  .route("/api/restaurants")
  .get(
    query("page").not().isEmpty().isInt(),
    query("perPage").not().isEmpty().isInt(),
    getRestaurants
  )
  .post(saveRestaurant);
app
  .route("/api/restaurants/:id")
  .get(getRestaurant)
  .put(updateRestaurant)
  .delete(deleteRestaurant);

db.initialize(process.env.mongoDB_string)
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`server listening on: ${HTTP_PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
