const express = require("express")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const router = express.Router();
const cookieParser = require('cookie-parser');


//import middleware
const { isUserLoggedIn} = require("../middlewares/authMiddleware");


//USER SCHEMA
const User = require("../databaseModels/user")

require('dotenv').config()

//mongodb connection
mongoose.connect('mongodb://127.0.0.1:27017/users');




router.use(express.urlencoded({ extended: true }))
// Use the cookie-parser middleware
router.use(cookieParser());


//routes FOR  USER  login

router.get("/login", isUserLoggedIn, async (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');




    res.render("login", { message: null, username: null })




})

router.post("/login", async (req, res) => {
    const username = req.body.username
    const password = req.body.password

    //check whether the user exists

    const user = await User.findOne({ username: username });
    if (!user) {
        console.log("Username not found")
        return res.render("login", { message: "Username Not Found!", username: null })
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
        return res.render("login", { message: "Wrong Credentials!", username: null })
    }

    //create a payload for serialize

    const userPayload = {
        username: user.username,
        role: user.role
    }

    //generate a token for the payload

    const token = await jwt.sign(userPayload, process.env.SECRET_KEY, {
        expiresIn: '300m', // Token expiration time

    });

    // Set the JWT token as a cookie in the response
    await res.cookie('jwt', token, {
        httpOnly: true // Make the cookie accessible only via HTTP (not JavaScript)

    });



    //if the login is successfull
    res.redirect(302, "/register")



})

router.get('/logout',async (req, res) => {

     res.clearCookie('jwt');
    res.redirect('/login'); // Redirect to the login page or any other appropriate destination
});




module.exports = router;














