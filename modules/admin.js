const express = require("express")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const cookieParser = require('cookie-parser');

const router = express.Router();

//import Admin midleware
const { verifyAdmin, isAdminLoggedIn } = require('../middlewares/adminMiddleware')

//USER SCHEMA
const User = require("../databaseModels/user")

//EVENTS SCHEMA
const Event = require("../databaseModels/events")


//TYRO SCHEMA
const TYRO = require("../databaseModels/tyro")


//IP SCHEMA
const IP = require("../databaseModels/ipAddress")

//mongodb connection 
mongoose.connect('mongodb://127.0.0.1:27017/users');






router.get("/admin", isAdminLoggedIn, async (req, res) => {
    res.render("admin", { message: null, username: null })
})


router.get("/tyro", verifyAdmin, async (req, res) => {

    const msg = req.query.msg || null
    const data = await GetTyro();
    res.render("tyro", { message: msg, username: req.user.username, user: data })
})


async function GetTyro() {

    try {
        const user = await TYRO.find({})


        return user
    }

    catch (error) {
        console.log(error)

    }
}



//delete the tyro 


router.get("/deleteTyro/:roll", verifyAdmin, async (req, res) => {
    const rollno = req.params.roll

    //delete the  event from the table
    await TYRO.deleteOne({ rollno: rollno }).then(async function () {
        console.log("TYRO deleted"); // Success
        //get tyro dat
        const data = await GetTyro();
        res.render("tyro", { message: "User Deleted!", username: req.user.username, user: data })


    }).catch(function (error) {
        console.log("TYRO delete: ", error);
    });


})
//save tyro data 
router.post("/tyro", verifyAdmin, async (req, res) => {
    const rollno = req.body.rollno.trim()
    const name = req.body.name.trim()
    const designation = req.body.desigSelect

    try {

        //check whether the tyro member exists

        const user = await TYRO.findOne({ rollno: rollno });

        if (!user) {

            //create tyro object
            const newUser = new TYRO({
                rollno: rollno,
                name: name,
                designation: designation

            })

            await newUser.save().then(async () => {
                const data = await GetTyro();



                res.render("tyro", { message: "User Registred!", username: req.user.username, user: data })

            }).catch((error) => {
                console.log(error);
            })

        }
        else {


            const message = "Already Registred!"
            console.log("TYRO EXISTS")
            return res.redirect(302, `/tyro?msg=${encodeURIComponent(message)}`)




        }

    }


    catch (error) {
        console.log("Tyro Post: ", error)
    }
})

router.post("/admin", async (req, res) => {
    const username = await req.body.username
    const password = await req.body.password

    //check whether the user exists

    const user = await User.findOne({ username: username });

    if (!user) {
        console.log("Username not found")
        return res.render("admin", { message: "Username Not Found!", username: null })
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
        return res.render("admin", { message: "Wrong Credentials!", username: null })
    }

    if (user.role !== "admin") {
        return res.render("admin", { message: "Not a admin!", username: null })
    }


    //create a payload for serialize

    const userPayload = {
        username: user.username,
        role: user.role
    }

    //generate a token for the payload

    const token = await jwt.sign(userPayload, process.env.SECRET_KEY, {
        expiresIn: '300s', // Token expiration time

    });

    // Set the JWT token as a cookie in the response
    await res.cookie('jwt', token, {
        httpOnly: true // Make the cookie accessible only via HTTP (not JavaScript)

    });



    //if the login is successfull
    res.redirect(302, "/adminDashboard")



})

router.get("/adminDashboard", verifyAdmin, async (req, res) => {
    res.render("adminDashboard", { message: null, username: req.user.username })
})

//get all the users and display them on the userRole addition page

async function getUsers() {

    const users = await User.find({})

    return users

}

router.get("/signup", verifyAdmin, async (req, res) => {
    //get all the users
    const users = await getUsers();



    res.render("addRoles", { message: null, username: req.user.username, users: users })


})


//delete user roles
router.get("/deleteRole/:name", verifyAdmin, async (req, res) => {
    console.log("delete called")
    const role = req.params.name

    //delete the  event from the table
    await User.deleteOne({ username: role }).then(function () {
        console.log("Role deleted"); // Success

        res.redirect(302, "/signup")


    }).catch(function (error) {
        console.log(error); // Failure
    });


})
router.post('/signup', verifyAdmin, async (req, res) => {
    const user = req.body.username.trim()

    //check whether the username exists
    const existingUser = await User.findOne({ username: user });

    //get all the users
    const users = await getUsers();


    if (existingUser) {

        res.render("addRoles", { message: "User Already Exists!", username: req.user.username, users: users });
    }

    else {

        //save the user to the database
        const newUser = new User({
            username: user,

            password: req.body.password,
            role: req.body.roleSelect
        });




        await newUser.save().then(() => {

            res.render("addRoles", { message: "Successfully Registered!", username: req.user.username, users: users });

        }).catch((error) => {
            console.log(error);
        })

    }
});


//function to get the events and display them on the admin panel
async function getEvents() {
    const individual = await Event.find({ type: "Individual" })
    const team = await Event.find({ type: "Team" })


    return { individual, team }


}





router.get("/addEvents", verifyAdmin, async (req, res) => {
    //display the events
    const events = await getEvents();

    res.render("addEvents", { username: req.user.username, message: null, indi: events['individual'], team: events['team'] })
})








router.post("/addEvents", verifyAdmin, async (req, res) => {

    const events = await getEvents();


    const evnt = req.body.event.trim()
    // const desc = req.body.description
    const type = req.body.typeSelect.trim()
    const venue = req.body.venue.trim()
    const time = req.body.time.trim()
    const max = req.body.mxprt

    //check whether event exists
    const eventExist = await Event.findOne({ event: evnt })

    if (eventExist) {
        //event already registered

        return res.render("addEvents", { message: "Event Already Registered!", username: req.user.username, indi: events['individual'], team: events['team'] })
    }

    else {

        //create new event payload
        const event = new Event({
            event: evnt,
            venue: venue,
            time: time,
            type: type,
            limit: max
        })



        await event.save().then(() => {
            res.render("addEvents", { message: "Registered Successfully", username: req.user.username, indi: events['individual'], team: events['team'] })
        }).catch((error) => {
            console.log(error);
        })
    }



})



router.get("/delete/:name", verifyAdmin, async (req, res) => {
    const event = req.params.name

    //delete the  event from the table
    await Event.deleteOne({ event: event }).then(function () {
        console.log("Blog deleted"); // Success

        res.redirect(302, "/addEvents")


    }).catch(function (error) {
        console.log(error); // Failure
    });


})



//add allowed ips

router.get("/addip", verifyAdmin, async (req, res) => {

    const msg = req.query.msg || null
    const data = await GetIPs();

    res.render("addIP", { username: req.user.username, message: msg, ipdata: data })


});



//GET ALL THE IPS

async function GetIPs() {

    try {
        const ip = await IP.find({})


        return ip
    }

    catch (error) {
        console.log(error)

    }
}


router.post("/addip", verifyAdmin, async (req, res) => {

    try {
        const ip = req.body.ip.trim()
        const pcname = req.body.pcname.trim();

        //check whether ip is already added
        const ipadded = await IP.findOne({ ip: ip });



        if (!ipadded) {

            //create tyro object
            const newIP = new IP({
                ip: ip,
                pcname: pcname,


            })

            await newIP.save().then(async () => {
                const data = await GetIPs();



                res.render("addip", { message: "IP Registred!", username: req.user.username, ipdata: data })

            }).catch((error) => {
                console.log(error);
            })




        }


        else {
            //ipalready exists

            const message = "IP already Registred!"
            console.log("IP EXISTS")
            return res.redirect(302, `/addip?msg=${encodeURIComponent(message)}`)

        }


    }

    catch (error) {
        console.log("ADD IP:", error)
    }

});


router.get("/deleteIP/:ip", verifyAdmin, async (req, res) => {


    const ip = req.params.ip

  
    await IP.deleteOne({ ip: ip }).then(async function () {
        console.log("IP deleted"); // Success
        //get ip data
        const data = await GetIPs();
        res.render("addip", { message: "IP Deleted!", username: req.user.username, ipdata: data })


    }).catch(function (error) {
        console.log("IP delete: ", error);
    });

});





module.exports = router;