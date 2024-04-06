const express = require("express")
const router = express.Router();
const jwt = require("jsonwebtoken")
const cors = require('cors');
router.use(express.urlencoded({ extended: true }))
router.use(cors())
//middleware to parse JSON data
router.use(express.json());

//import middleware
const { verifyUser } = require('../middlewares/authMiddleware');
const { verifyAdmin } = require('../middlewares/adminMiddleware');


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




async function getEventVenue(event) {
    //function to return individual student data based on roll no to display on register form


    try {
        const venue = await Event.findOne({ event: event })





        return venue['venue']




    }

    catch (error) {
        console.log(error)
    }

}

async function getEventTime(event) {
    //function to return individual student data based on roll no to display on register form


    try {
        const venue = await Event.findOne({ event: event })





        return venue['time']




    }

    catch (error) {
        console.log(error)
    }

}

//find tid if pid in members
async function getEventTID(pid) {
    //function to return individual student data based on roll no to display on register form


    try {
        const data = await Team.find({ members: pid })






        return data




    }

    catch (error) {
        console.log(error)
    }

}








//route to generate pdf 
router.get("*/print", async (req, res) => {

    console.log("/print",req.originalUrl)

    let pid = req.query.pid
    pid = pid.toUpperCase()

    //get student data using PID
    const student = await getStudentDataPID(pid);

    //get event tid if pid exists
    const data = await getEventTID(pid)


    console.log("data", data)

    const eventsIndi = []
    const eventsTeam = []
    let nested = []
    let nested1 = []

    //get the venue of the events and save them in dict and return

    for (const i in student['singleEvent']) {
        nested1 = []
        nested1.push(student['singleEvent'][i])
        nested1.push(await getEventVenue(student['singleEvent'][i]))
        nested1.push(await getEventTime(student['singleEvent'][i]))
        eventsIndi.push(nested1)





    }

    for (const i in data) {
        nested = []
        nested.push(data[i]['tid'])
        nested.push(data[i]['name'])

        nested.push(data[i]['event'])
        nested.push(await getEventVenue(data[i]['event']))
        nested.push(await getEventTime(data[i]['event']))
        nested.push(data[i]['members'].join(", "))
        eventsTeam.push(nested)

    }



    //console.log(eventsIndi)



    res.render("pdf", {username:null, individualData: student, indiEvents: eventsIndi, teamEvents: eventsTeam });

})


router.get("/barcode", verifyUser, async (req, res) => {
    res.render("barcode", { username: req.user.username});



})

router.post("/barcode", (req, res) => {
    try {
        console.log(req.body);
        
        const jsonData={roll:"12345",name:"Amit",phone:"7505574391"}

        const jsonDataString = JSON.stringify(jsonData);
        res.redirect(`/register?jsonData=${encodeURIComponent(jsonDataString)}`);

    } catch (error) {


        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});



router.get("/register", verifyUser, async (req, res) => {

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    const msg = req.query.msg || null;

    let barcodeData=req.query.jsonData|| null;

    if (barcodeData != null){
        barcodeData=JSON.parse(req.query.jsonData)
    }




    console.log("Barcode data"+barcodeData)


    res.render("register", { username: req.user.username, message: msg, student: null, event: null,barcode:barcodeData })


})

// router.get("/register", verifyUser, async (req, res, next) => {
//     try {
//         const msg = req.query.msg || null;
//         console.log(msg);
//         res.render("register", { username: req.user.username, message: msg, student: null, event: null, barcodedata: null });
//     } catch (error) {
//         // Handle errors here
//         next(error); // Pass the error to the error handling middleware
//     }
// });




async function getLastCount() {
    //count number of students
    try {
        // Count the number of students
        const count1 = await Count.findOne({ name: "lastCount" })

        if (count1) {
            const lastVal = count1.count;
            return lastVal
        }

        else {
            return false;
        }


    } catch (err) {
        console.error(err);
        throw err;
    }
}



async function getStudentData(rollno) {
    //function to return individual student data based on roll no to display on register form


    try {
        const student = await Individual.findOne({ rollno: rollno })
        //console.log(student)




        return student




    }

    catch (error) {
        console.log(error)
    }

}

async function getStudentDataPID(pid) {
    //function to return individual student data based on roll no to display on register form
    let pid1 = pid.charAt(0)
    pid1 = pid1.toUpperCase()


    try {

        if (pid1 === "P") {
            const student = await Individual.findOne({ pid: pid.toUpperCase() })
            if (student) {
                return student
            }
            else {
                return false
            }
        }


        else if (pid1!="P"  || pid1!="T"){

            const student = await Individual.findOne({ phone: pid })
            if (student) {
                return student
            }
            else {
                return false
            }

        }
        else {

            const student = await Individual.findOne({ rollno: pid.toUpperCase() })
            if (student) {
                return student
            }
            else {
                return false
            }
        }

        //console.log(student)








    }

    catch (error) {
        console.log(error)
    }

}
//function to get Individual Events

async function getIndividualEvents() {
    try {
        const individualEvents = await Event.find({ type: "Individual" })
        //console.log(student)




        return individualEvents




    }

    catch (error) {
        console.log(error)
    }


}

//function to get Team Events

async function getTeamEvents() {
    try {
        const individualEvents = await Event.find({ type: "Team" })
        //console.log(student)




        return individualEvents




    }

    catch (error) {
        console.log(error)
    }


}
router.post("/pid", verifyUser, async (req, res) => {
    const Pid = req.body.pid
    //get student data using PID

    const student = await getStudentDataPID(Pid);

    //GET individual event
    const individualEvents = await getIndividualEvents()

    console.log(Pid, student)

    res.render("register", { username: req.user.username, message: null, student: student, event: individualEvents,barcode:null });




})

router.post("/searchPIDtid", verifyUser, async (req, res) => {
    let id = req.body.pid
    id = id.toUpperCase()
    let id1 = id.charAt(0)

    if (id1 === "P") {

        try {

            const data = await Team.find({ members: id })
            console.log(data)
            const teamEvents = await getTeamEvents()
            if (data.length !== 0) {

                res.render("addTID", { username: req.user.username, message: null, student: null, event: teamEvents, search: data })
            } else {
                res.render("addTID", { username: req.user.username, message: null, student: null, event: teamEvents, search: null })
            }

        }
        catch (error) {
            console.log(error)
        }


    }

    else {
        try {

            const data = await Team.find({ tid: id })
            console.log(data)
            const teamEvents = await getTeamEvents()
            if (data.length !== 0) {

                res.render("addTID", { username: req.user.username, message: null, student: null, event: teamEvents, search: data })
            } else {
                res.render("addTID", { username: req.user.username, message: null, student: null, event: teamEvents, search: null })
            }

        }
        catch (error) {
            console.log(error)
        }
    }


})

//sample pid api get data
router.get("/pid/:id", verifyUser, async (req, res) => {
    const Pid = req.params.id
    //get student data using PID

    const student = await getStudentDataPID(Pid);
    if (student) {
        console.log(Pid, student)

        res.json({ student })
    }
    else {
        res.json({ student: "Not Found" })
    }

})




//check team name

router.post("/checkTeamName", async (req, res) => {


    console.log("checkTeamName called")


    const name1 = req.body.name
    console.log("asas: ", name1)



    try {


        if (name1 !== "null") {
            console
            const team = await Team.findOne({ name: name1 })

            console.log("teammmmm", team)
            if (team) {

                res.json({ status: true })
            }


            else {
                res.json({ status: false })
            }
        }


        else {
            res.json({ status: false })

            //if the name is not defined then return false
        }




    }


    catch (error) {
        console.log(error)
    }
})
//check pid team

router.post("/checkPidTeam", async (req, res) => {
    const pid = req.body.pid
    const event = req.body.event


    try {

        const data = await Team.findOne({ event: event, members: pid })

        if (data) {
            res.json({ status: true, data: data })
        } else {
            res.json({ status: false, data: "Not Found" })
        }

    }
    catch (error) {
        console.log(error)
    }



})


//sample pid api get maximum members in events
router.get("/getMax/:id", verifyUser, async (req, res) => {
    const name = req.params.id
    //get student data using PID



    try {

        const mx = await Event.findOne({ event: name })

        console.log("max limit", mx.limit)

        res.json({ data: mx.limit })
    }

    catch (error) {
        console.log(error)
    }



})

//save team
router.post("/saveTeam", verifyUser, async (req, res) => {
    const data = req.body

    const lastCount = await getLastCount();
    console.log("Last Count", lastCount)

    const tid = "T" + Number(lastCount + 1)
    const team = await new Team({
        tid: tid,
        name: data['name'].toUpperCase(),  ///team name

        event: data['event'],
        members: data['data']
    })

    //save the student

    await team.save().then((data) => {

        //after saving the student display data along with PID
        // const student = await getStudentData(rollno);
        // console.log(student)

        res.json({ message: data })

    }).catch((error) => {
        console.log(error);
    })


})

//delete tid 
router.get("/deleteTeam/:id", verifyAdmin, async (req, res) => {
    const tid = req.params.id

    //delete the  individual event user from the table
    await Team.deleteOne({ tid: tid }).then(function () {
        console.log("TID deleted"); // Success

        res.redirect(302, "/tid")


    }).catch(function (error) {
        console.log(error); // Failure
    });

})

router.get("/deletePID/:id", verifyAdmin, async (req, res) => {
    const pid = req.params.id



    try {
        //check whetther the PID is registered with any team
        //if registered then delete the Pid from  the team
        const checkPid = await Team.find({ members: pid })

        if (checkPid.length !== 0) {

            const updated = await Team.updateMany({}, { $pull: { members: pid } })
            console.log("Delete PID Updated in Team", updated)

        }




        //delete the  individual event user from the table
        await Individual.deleteOne({ pid: pid }).then(function () {
            console.log("PID deleted"); // Success

            res.redirect(302, "/register")


        })

    }


    catch (error) {
        console.log(error)
    }


    // res.render("register", { username: req.user.username, message: null,student:student});

})

async function getTeamCountParticipation(pid) {


    try {

        const count = await Team.countDocuments({ members: pid })


        return count

    }

    catch (error) {
        console.log(error)
    }

}
async function getSingleCountParticipation(pid) {


    try {

        const count = await Individual.findOne({ pid: pid })
        const len = count['singleEvent'].length


        return len

    }

    catch (error) {
        console.log(error)
    }

}
router.post("/checkTeamCondition", async (req, res) => {
    const pid = req.body.pid

    try {
        //get individual  student data with pid
        const student = await getStudentDataPID(pid);

        //check if the student belongs to the TYRO post

        const tyroMem = await Tyro.findOne({ rollno: student.rollno })

        //check individual event participation

        const indiCount = await getSingleCountParticipation(pid)


        //get count of team events participated by PID
        const teamCount = await getTeamCountParticipation(pid);

        console.log("ttt", teamCount)


        //check for TYRO members 

        if (tyroMem) {
            const upperBody = ["President", "Vice President", "Secretary", "Joint Secretary", "Treasurer"]

            //for upper body 
            if (upperBody.includes(tyroMem.designation)) {

                //upper body can't participate in any event

                console.log("Sorry! Tyro upper body can't participate in any event!")


                const message = "Sorry! Tyro upper body can't participate in any event!"

                return res.json({ status: false, data: message })

            }

            //for tyro Executives
            else if (tyroMem.designation === "Executive") {
                if (teamCount === 0) {

                    res.json({ status: "true", data: "" })

                }
                else {
                    res.json({ status: false, data: "Executives Can only participate in only 1 event" })
                }

            }



            //for JC members and JC Volunteer
            else if (tyroMem.designation === "JC" || tyroMem.designation === "JC Volunteer") {

                //JC can only participate in any 3 events

                if ((indiCount + teamCount < 3) && teamCount === 0) {

                    res.json({ status: true, data: "" })
                }

                else {
                    console.log("JC Members & Volunteers can only participate in 3 events!")


                    res.json({ status: false, data: "JC Members & Volunteers can only participate in 3 events!" })
                }
            }





            //for cordinators
            else if (tyroMem.designation === "Cordinator") {

                //JC can only participate in any 3 events

                if ((indiCount + teamCount < 4)) {

                    res.json({ status: true, data: "" })
                }

                else {
                    console.log("Cordinators can only participate in 4 events!")


                    res.json({ status: false, data: "Cordinators can only participate in 4 events!" })
                }
            }



            //for chairperson
            else if (tyroMem.designation === "Chairperson") {

                //JC can only participate in any 3 events

                if ((indiCount + teamCount < 3)) {

                    res.json({ status: true, data: "" })
                }

                else {
                    console.log("Chairpersons can only participate in 3 events!")


                    res.json({ status: false, data: "Chairpersons can only participate in 3 events!" })
                }
            }





        }

        else {

            //check for student of SRMS CET (can participate in 7 events)
            if (student.college === "SRMS CET") {
                if (indiCount + teamCount < 7) {
                    res.json({ status: true, data: "" })
                }

                else {
                    console.log("Students of SRMS CET can participate in maximum 7 events!")

                    res.json({ status: false, data: "Students of SRMS CET can participate in maximum 7 events!" })
                }
            }


            // check for other college students 
            else {
                if (indiCount + teamCount < 5) {
                    res.json({ status: true, data: "" })
                }

                else {

                    console.log("Student of other colleges can participate in maximum 5 events!")



                    res.json({ status: false, data: "Student of other colleges can participate in maximum 5 events!" })

                }
            }

        }



    }

    catch (error) {

    }


})

//middleware  to get the count of events the pid has participated (single nd team both)

async function userParticipationValidation(req, res, next) {

    const pid = req.params.id
    let events = req.body.events //user sending the event list



    try {
        //get individual  student data with pid
        const student = await getStudentDataPID(pid);

        //get count of team events participated by PID
        const teamCount = await getTeamCountParticipation(pid);

        //check if the student belongs to the TYRO post

        const tyroMem = await Tyro.findOne({ rollno: student.rollno })

        //check for TYRO members 

        if (tyroMem) {

            const upperBody = ["President", "Vice President", "Secretary", "Joint Secretary", "Treasurer"]



            //for upper body 
            if (upperBody.includes(tyroMem.designation)) {

                //upper body can't participate in any event

                console.log("Sorry! Tyro upper body can't participate in any event!")

                //set the req message

                //req.tyroMsg = "Sorry! Tyro upper body can't participate in any event!"
                const message = "Sorry! Tyro upper body can't participate in any event!"
                return res.redirect(302, `/register?msg=${encodeURIComponent(message)}`)

            }

            //for tyro Executives
            else if (tyroMem.designation === "Executive") {
                //the single element is not in the form of array so convert to array
                if (!Array.isArray(events)) {
                    events = Array.from([events]);
                }

                if (events.length === 1) {
                    next();
                }
                else {
                    console.log("Executives can participate in one Individual Event only")

                    //set the req message
                    const message = "Executives can participate in one Individual Event only"
                    return res.redirect(302, `/register?msg=${encodeURIComponent(message)}`)

                }
            }


            //for JC members and JC volunter
            else if (tyroMem.designation === "JC" || tyroMem.designation === "JC Volunteer") {

                //JC can only participate in any 3 events
                if (!Array.isArray(events)) {
                    events = Array.from([events]);
                }

                if (events.length + teamCount <= 3) {

                    next();
                }

                else {
                    console.log("JC Members & Volunteers can only participate in 3 events!")

                    //set the req message

                    const message = "JC Members can only participate in 3 events!"
                    return res.redirect(302, `/register?msg=${encodeURIComponent(message)}`)
                }
            }




            //for Chairpersons
            else if (tyroMem.designation === "Chairperson") {

                //JC can only participate in any 3 events
                if (!Array.isArray(events)) {
                    events = Array.from([events]);
                }

                if ((events.length + teamCount) <= 3) {
                    console.log(events.length, teamCount)

                    next();
                }

                else {
                    console.log("Chairpersons can only participate in 3 events!")

                    //set the req message

                    const message = "Chairpersons can only participate in 3 events!"
                    return res.redirect(302, `/register?msg=${encodeURIComponent(message)}`)
                }
            }



            //for Cordinators
            else if (tyroMem.designation === "Cordinator") {

                //JC can only participate in any 3 events
                if (!Array.isArray(events)) {
                    events = Array.from([events]);
                }

                if (events.length + teamCount <= 4) {

                    next();
                }

                else {
                    console.log("Cordinators can only participate in 4 events!")

                    //set the req message

                    const message = "Cordinators can only participate in 4 events!"
                    return res.redirect(302, `/register?msg=${encodeURIComponent(message)}`)
                }
            }






        }

        //check for normal students 
        else {

            //check for student of SRMS CET (can participate in 7 events)
            if (student.college === "SRMS CET") {

                if (!Array.isArray(events)) {
                    events = Array.from([events]);
                }

                if (events.length + teamCount <= 7) {
                    next();
                }

                else {
                    console.log("Students of SRMS CET can participate in maximum 7 events!")

                    //set the req message
                    const message = "Students of SRMS CET can participate in maximum 7 events!"
                    return res.redirect(302, `/register?msg=${encodeURIComponent(message)}`)
                }
            }


            // check for other college students 
            else {
                if (!Array.isArray(events)) {
                    events = Array.from([events]);
                }
                if (events.length + teamCount <= 5) {
                    next();
                }

                else {

                    console.log("Student of other colleges can participate in maximum 5 events!")

                    //set the req message
                    const message = "Student of other colleges can participate in maximum 5 events!"
                    return res.redirect(302, `/register?msg=${encodeURIComponent(message)}`)

                }
            }


        }



    } catch (error) {
        console.log(error)
        next();
    }
}




router.post("/updateEvent/:id", verifyUser, userParticipationValidation, async (req, res) => {

    console.log("/updateEvent called",req.originalUrl)

    // if no event is selected then it is undefined so set it to empty array

    const events = req.body.events || []
    const pid = req.params.id
    console.log(pid, events)


    //GET individual event
    const individualEvents = await getIndividualEvents()







    try {
        const update = await Individual.updateOne({ pid: pid }, { $set: { singleEvent: events } }).then(async () => {
            const student = await getStudentDataPID(pid) || null;

            console.log("/updateEvent called",req.originalUrl)

            res.render("register", { username: req.user.username, message: "Events Updated Sucessfully!", student: student, event: individualEvents ,barcode:null});
        });

    } catch (error) {
        console.error(error);
    }







})


router.post("/register", verifyUser, async (req, res) => {


    let barcodeData=req.query.jsonData|| null;

    if (barcodeData != null){
        barcodeData=JSON.parse(req.query.jsonData)
    }

    const rollno = req.body.rollno.trim()
    const name = req.body.name.trim()
    const phone = req.body.phone.trim()
    const college = req.body.collegeSelect
    const branch = req.body.branchSelect
    const year = req.body.yearSelect


    //chech whether rollno is inserted or not
    const existingUser = await Individual.findOne({ rollno: rollno });

    if (existingUser) {
        const msg = "User Already Exists! PID:- " + existingUser['pid']

        res.render("register", { username: req.user.username, message: msg, username: null, student: null, event: null,barcode:barcodeData });
    }

    else {
        //create student payload

        const lastCount = await getLastCount();
        console.log("Last Count", lastCount)

        const pid = "P" + Number(lastCount + 1)
        const student = await new Individual({
            pid: pid,
            rollno: rollno,
            name: name,
            phone: phone,
            college: college,
            branch: branch,
            year: year
        })

        //save the student

        await student.save().then(async () => {

            //after saving the student display data along with PID
            const student = await getStudentData(rollno);
            console.log(student)

            res.render("register", { username: req.user.username, message: "Successfully Registered!", student: student, event: null,barcode:barcodeData });

        }).catch((error) => {
            console.log(error);
        })


    }





})



// TID SECTION 



router.get("/tid", verifyUser, async (req, res) => {
    //GET individual event
    const teamEvents = await getTeamEvents()
    res.render("addTID", { username: req.user.username, message: null, student: null, event: teamEvents, search: null })
})

module.exports = router;