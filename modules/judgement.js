const express = require("express")
const excelJS = require("exceljs");
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






    const studentCount = await totalStudentsCount(); //get total students
    const teamCount = await totalTeamsRegistered();  //total teams registered
    const teamEvent = await getTeamEvents();     //get all the team events
    const indiEvents = await getIndividualEvents(); //get all the individual events

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




router.get("/expandTeam", verifyJC, async (req, res) => {
    //display details of the pid in the table

    let tid = req.query.tidInp.toUpperCase()

    //first get the detail of the tid members
    //then get the detail of the each pid

    try {
        const tidData = await Team.findOne({ tid: tid })

        if (tidData) {
            let members = tidData['members']
            let data = {}



            for (const i in members) {


                let pidData = await Individual.findOne({ pid: members[i] })

                if (pidData){
                    data[members[i]] = { "pid": pidData['pid'], "name": pidData['name'], "rollno": pidData['rollno'], branch: pidData['branch'], "college": pidData['college'], "year": pidData['year'], "phone": pidData['phone'] }
                }
              

            }
            console.log(data)



            res.render("expandTeam", { data: data, tid: tidData['tid'], event: tidData['event'],name:tidData['name'] ,username: req.user.username })






        }


        else {
            res.render("expandTeam", { data: null, tid: null, event: null, username: req.user.username })
        }

    }

    catch (error) {
        console.log(error)
    }




})




router.get("/exportTeam/:name", async (req, res) => {
    //export team event data in excel format


    const name = req.params.name

    const data = await Team.find({ event: name })

    if (data) {
        const workbook = new excelJS.Workbook();

        const worksheet = workbook.addWorksheet(name);
        let users = []
        let jsonData = {}

        worksheet.getCell('A1').value = name

        worksheet.mergeCells('A1:B1')
        worksheet.getCell('A1').alignment = { horizontal: 'center' }



        const columnHeaderRow = worksheet.addRow(['TID','TEAM NAME', 'MEMBERS']);


        columnHeaderRow.eachCell(cell => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '00FF00' } // Set background color of the header cells to green
            };
            cell.font = { bold: true };
        });

        worksheet.columns = [
            { key: "tid", width: 15 },
            { key: "teamname", width: 25 },
            { key: "members", width: 100 },

        ];







        //add json and add data to array

        for (const i in data) {
            jsonData["tid"] = data[i]['tid']
            jsonData["teamname"] = data[i]['name']
            jsonData["members"] = data[i]['members']


            users.push(jsonData)
            jsonData = {}


        }

        users.forEach(user => { worksheet.addRow(user); });


        console.log(users)





        // Set up the response headers 
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"); res.setHeader("Content-Disposition", "attachment; filename=" + name + ".xlsx");

        // Write the workbook to the response object 
        await workbook.xlsx.write(res).then(() => res.end());




    }

})


router.get("/exportIndividual/:name", async (req, res) => {
    const name = req.params.name

    const workbook = new excelJS.Workbook();

    const worksheet = workbook.addWorksheet(name);

    const data = await Individual.find({ singleEvent: name })

    if (data) {
        let users = []
        let jsonData = {}





        worksheet.getCell('A1').value = name

        worksheet.mergeCells('A1:G1')
        worksheet.getCell('A1').alignment = { horizontal: 'center' }


        // worksheet.addRow(2).values = ['PID', 'ROLL NO', 'NAME', 'COLLEGE', 'PHONE', 'BRANCH', "YEAR"]
        const columnHeaderRow = worksheet.addRow(['PID', 'ROLL NO', 'NAME', 'COLLEGE', 'PHONE', 'BRANCH', 'YEAR']);


        columnHeaderRow.eachCell(cell => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '00FF00' } // Set background color of the header cells to green
            };
            cell.font = { bold: true };
        });
        worksheet.columns = [
            { key: "pid", width: 15 },
            { key: "rollno", width: 20 },
            { key: "name", width: 30 },
            { key: "college", width: 25 },
            { key: "phone", width: 15 },
            { key: "branch", width: 10 },
            { key: "year", width: 10 }
        ];



        //add json and add data to array

        for (const i in data) {
            jsonData["pid"] = data[i]['pid']
            jsonData["rollno"] = data[i]['rollno']
            jsonData["name"] = data[i]['name']
            jsonData["college"] = data[i]['college']
            jsonData["phone"] = data[i]['phone']
            jsonData["branch"] = data[i]['branch']
            jsonData["year"] = data[i]['year']

            users.push(jsonData)
            jsonData = {}


        }

        users.forEach(user => { worksheet.addRow(user); });


        console.log(users)





        // Set up the response headers 
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"); res.setHeader("Content-Disposition", "attachment; filename=" + name + ".xlsx");

        // Write the workbook to the response object 
        await workbook.xlsx.write(res).then(() => res.end());


    }
})





module.exports = router;