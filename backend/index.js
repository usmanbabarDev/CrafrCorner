const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const Checkout = require("./checkoutModel"); // Import Checkout model
const CardDetail = require("./cardDetailModel"); // Import CardDetail model
const User = require("./userModel");

dotenv.config();

const app = express();
const port = process.env.PORT || 9000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));


// Define the POST endpoint to handle checkout data
app.post("/checkout", async (req, res) => {
  try {
    const { cartTotalPrice, ...checkoutData } = req.body;

    // Ensure that cartTotalPrice is provided in the request body
    if (!cartTotalPrice) {
      return res.status(400).json({ error: "Total price is required" });
    }

    // Create a new document with the submitted data
    const newCheckout = new Checkout({ ...checkoutData, totalPrice: cartTotalPrice });
    
    // Save the document to the database
    await newCheckout.save();

    res.json({ message: "Checkout data saved successfully" });
  } catch (error) {
    console.error("Error saving checkout data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Define endpoints to fetch the latest checkout and card detail records
app.get("/latest/checkout", async (req, res) => {
  try {
    const checkout = await Checkout.findOne().sort({ _id: -1 }).populate('cardDetail');
    if (!checkout) {
      return res.status(404).json({ error: "Checkout not found" });
    }
    res.json(checkout);
  } catch (error) {
    console.error("Error fetching checkout details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/latest/card-detail", async (req, res) => {
  try {
    const cardDetail = await CardDetail.findOne().sort({ _id: -1 });
    if (!cardDetail) {
      return res.status(404).json({ error: "Card detail not found" });
    }
    res.json(cardDetail);
  } catch (error) {
    console.error("Error fetching card detail:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update the POST endpoint to return the ID of the newly created card detail document
app.post("/card-details", async (req, res) => {
  try {
    const newCardDetail = new CardDetail(req.body);
    const savedCardDetail = await newCardDetail.save();
    res.json({ message: "Card details saved successfully", id: savedCardDetail._id });
  } catch (error) {
    console.error("Error saving card details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Register endpoint
app.post("/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;
    // Check if required fields are provided
    if (!username || !password || !email) {
      return res.status(400).json({ error: "Please fill all the fields" });
    }
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }
    // Create a new user
    const newUser = new User({ username, password, email });
    await newUser.save();
    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login endpoint
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    // Check if required fields are provided
    if (!username || !password) {
      return res.status(400).json({ error: "Please fill all the fields" });
    }
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Check if password is correct
    if (user.password !== password) {
      return res.status(401).json({ error: "Incorrect password" });
    }
    // If everything is fine, send success response
    res.json({ message: "Login successful" });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
