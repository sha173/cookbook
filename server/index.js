const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const RecipeModel = require("./models/recipes");
const jwt = require("jsonwebtoken");
const UserModel = require("./models/users");
const IngredientModel = require("./models/ingredients");

require("dotenv").config({ path: "../.env" });
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(
  `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cookbook.efjxjit.mongodb.net/cookbook`
);

app.post("/authenticate", async (req, res) => {
  let { username, password } = req.body;
  let existingUser;

  try {
    existingUser = await UserModel.findOne({ username: username });
  } catch {
    res.status(500).json({ message: "Error authenticating user" });
  }
  if (!existingUser || existingUser.password != password) {
    res.status(500).json({ message: "Incorrect credentials" });
  } else {
    let token;
    try {
      token = jwt.sign(
        { username: existingUser.username },
        "secretkeyappearshere",
        { expiresIn: "1h" }
      );
      res.json({
        token: token,
        expiresIn: 60 * 60,
        authUserState: { username: existingUser.username },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }
});

app.get("/user/:id/grocery", async (req, res) => {
  try {
    let response = await UserModel.findOne({ username: req.params.id });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      message: `Error getting grocery list for user ${req.params.id}`,
    });
  }
});

app.put("/user/:id/grocery", async (req, res) => {
  const obj = req.body;
  try {
    let response = await UserModel.updateOne(
      { username: req.params.id },
      {
        grocery: [...obj],
      }
    );
    res.status(200);
    res.json(response);
  } catch (error) {
    console.log(error);
    res.status(500);
    res.json(error.message);
  }
});

app.get("/recipes/getAll", async (req, res) => {
  console.log("Getting all recipes");
  try {
    let response = await RecipeModel.find();
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.get("/recipes/get", async (req, res) => {
  try {
    let response = await RecipeModel.findOne(req.query);
    res.status(200);
    res.json(response);
  } catch (error) {
    console.log(error);
    res.status(400);
    res.json(error);
  }
});

app.post("/recipes/add", async (req, res) => {
  const obj = req.body;
  try {
    let response = await RecipeModel.create(obj);
    res.status(200);
    res.json(response);
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      res.status(400);
      res.json("A recipe with that title already exists.");
    } else {
      res.status(500);
      res.json(error.message);
    }
  }
});

app.put("/recipes/:id", async (req, res) => {
  const obj = req.body;
  try {
    RecipeModel.validate(obj);
    let response = await RecipeModel.updateOne({ key: obj.key }, obj);
    res.status(200);
    res.json(response);
  } catch (error) {
    console.log(error);
    res.status(500);
    res.json(error.message);
  }
});

app.delete("/recipes/:id", async (req, res) => {
  console.log(`Deleting ${req.params.id}`);
  try {
    let response = await RecipeModel.deleteOne({ key: req.params.id });
    res.status(200);
    res.json(response);
  } catch (error) {
    console.log(error);
    res.status(500);
    res.json(error.message);
  }
});

app.get("/ingredients/:id", async (req, res) => {
  console.log(`Getting ingredient ${req.params.id}`);
  try {
    let response = await IngredientModel.findOne({ fdcId: req.params.id });
    res.status(200);
    res.json(response);
  } catch (error) {
    console.log(error);
    res.status(400);
    res.json(error);
  }
});

app.post("/ingredients/add", async (req, res) => {
  const obj = req.body;
  try {
    let response = await IngredientModel.create(obj);
    res.status(200);
    res.json(response);
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      res.status(400);
      res.json("An ingredient with that FDC ID already exists.");
    } else {
      res.status(500);
      res.json(error.message);
    }
  }
});

app.get("/healthcheck", async (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(3000, () => {
  console.log("server is running");
});
