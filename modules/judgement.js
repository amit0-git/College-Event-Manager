const express = require("express")

const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const { verifyJC, isJCLoggedIn } = require("../middlewares/judgementMiddleware")

const router = express.Router();







//COUNT SCHEMA
const Count = require("../databaseModels/count")

//EVENTS SCHEMA
const Event = require("../databaseModels/events")

//students PID schema
const Individual = require("../databaseModels/individualEvent")

//students TID schema
const Team = require("../databaseModels/teamEvents")

//tyro schema
const Tyro = require("../databaseModels/tyro")

//USER SCHEMA
const User = require("../databaseModels/user")



//function to get the count of the total students registered
async function totalStudentsCount() {

    try {
        const student = await Individual.countDocuments({})

        if (student) {
            return student
        }
        else {
            return 0
        }

    }
    catch (error) {
        console.log(error)

    }
}

//function to get the count of team registered

async function totalTeamsRegistered() {


    try {

        const teams = await Team.countDocuments({})

        if (teams) {
            return teams
        }
        else {
            return 0
        }

    }
    catch (error) {
        console.log(error)
    }
}

//function to get Individual Events

async function getIndividualEvents() {
    try {
        const individualEvents = await Event.find({ type: "Individual" }, "event")
        //console.log(student)




        if (individualEvents) {
            return individualEvents
        }
        else {
            false
        }




    }

    catch (error) {
        console.log(error)
    }


}

//function to get Team Events

async function getTeamEvents() {
    try {
        const teamEvents = await Event.find({ type: "Team" }, "event")
        //console.log(student)

        if (teamEvents) {
            return teamEvents
        }
        else {
            false
        }




    }

    catch (error) {
        console.log(error)
    }


}

//ROUTES FOR JC COMMITEE LOGIN

router.post("/getCount", verifyJC, async (req, res) => {
    const type = req.body.type
    const event = req.body.event

    if (type === "1") {

        try {
            const result = await Individual.countDocuments({ singleEvent: event })

            if (result) {
                res.json(result)
            }
            else {
                res.json(0)
            }

        }

        catch (error) {
            console.log(error)
        }

    }


    else {
        try {
            const result = await Team.countDocuments({ event: event })

            if (result) {
                res.json(result)
            }
            else {
                res.json(0)
            }

        }

        catch (error) {
            console.log(error)
        }

    }
})


router.get("/jc", verifyJC, async (req, res) => {

    console.log("jc called")

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');






    const studentCount = await totalStudentsCount();
    const teamCount = await totalTeamsRegistered();
    const teamEvent = await getTeamEvents();
    const indiEvents = await getIndividualEvents();
    const data = {
        students: studentCount,
        teams: teamCount,
        eventSingle: indiEvents,
        eventTeam: teamEvent
    }


    res.render("jcDashboard", { username: req.user.username, data: data })
})


router.get("/jcLogin", isJCLoggedIn, (req, res) => {

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.render("jcLogin", { message: null, username: null })
})


router.post("/jcLogin", async (req, res) => {
    const username = req.body.username
    const password = req.body.password

    //check whether the user exists

    const user = await User.findOne({ username: username });

    if (!user) {
        console.log("Username not found")
        return res.render("jcLogin", { message: "Username Not Found!", username: null })
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
        return res.render("jcLogin", { message: "Wrong Credentials!", username: null })
    }

    if (user.role !== "jc") {
        return res.render("jcLogin", { message: "Not a Member of JC Commitee!", username: null })
    }


    //create a payload for serialize

    const userPayload = {
        username: user.username,
        role: user.role
    }

    //generate a token for the payload

    const token = await jwt.sign(userPayload, process.env.SECRET_KEY, {
        expiresIn: '1300s', // Token expiration time

    });

    // Set the JWT token as a cookie in the response
    await res.cookie('jwt', token, {
        httpOnly: true // Make the cookie accessible only via HTTP (not JavaScript)

    });



    //if the login is successfull
    res.redirect(302, "/jc")



})




router.get("/expandTeam",verifyJC, async (req, res) => {
    let tid = req.query.tidInp.toUpperCase()

    //first get the detail of the tid members
    //then get the detail of the each pid

    try {
        const tidData = await Team.findOne({ tid: tid })

        if (tidData){
            let members=tidData['members']
            let data={}



            for (const i in members){

             
                let pidData=await Individual.findOne({pid:members[i]})
                data[members[i]]={"pid":pidData['pid'],"name":pidData['name'],"branch":pidData['branch'],"college":pidData['college'],"year":pidData['year'],"phone":pidData['phone']}

            }
            console.log(data)



            res.render("expandTeam",{data:data,tid:tidData['tid'],event:tidData['event'],username:req.user.username})
          

            
            

            
        }


        else{
            res.render("expandTeam",{data:null,tid:null,event:null,username:req.user.username})
        }

    }

    catch (error) {
        console.log(error)
    }




})






module.exports = router;