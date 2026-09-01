const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const User = require("./user");

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/games")
    .then(() => {
        console.log("MongoDB Connected");
    })
    .catch((error) => {
        console.log("MongoDB Error:", error);
    });


// Signup
app.post("/signup", async (req, res) => {

    const { name, email, password } = req.body;

    const user = new User({
        name,
        email,
        password
    });

    await user.save();

    res.json({
        message: "Signup successful"
    });
});


// Login
app.post("/login", async (req, res) => {

    const { email, password } = req.body;

    const user = await User.findOne({
        email,
        password
    });

    if (!user) {
        return res.json({
            message: "Invalid email or password"
        });
    }

    res.json({
        message: "Login successful"
    });
});


// Start server
app.listen(5000, () => {
    console.log("Server running on port 5000");
});