const express = require("express")
const mongoose = require("mongoose")
const cookieParser = require('cookie-parser');

const cors = require('cors');







//modules 
const authRoutes = require('./modules/auth');
const studentRoutes = require('./modules/studentRegister');
const adminRoutes = require('./modules/admin');
const jcRoutes = require("./modules/judgement")

//USER SCHEMA
const User = require("./databaseModels/user")


//IP SCHEMA
const IP = require("./databaseModels/ipAddress")


require('dotenv').config()


//mongodb connection
//old zest database =users
mongoose.connect('mongodb://127.0.0.1:27017/users');


app = express()





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



const allowedIPss = GetIPs();
const allowedIPs = ['127.0.0.1'];


allowedIPss.then((data) => {
    data.forEach((elem) => {
        allowedIPs.push(elem['ip'])
    })
})


// Middleware to restrict requests to allowed IP addresses
const restrictIP = (req, res, next) => {
    const clientIP = req.ip; // Get client's IP address
    console.log("Allowed IPs: ", allowedIPs)

    // Check if the client's IP is in the allowedIPs array
    if (allowedIPs.includes(clientIP)) {
        // If the IP is allowed, proceed to the next middleware
        next();
    } else {
        // If the IP is not allowed, send a 403 Forbidden response
        res.status(403).render("restrictedIP")
    }
};

// Apply the restrictIP middleware to all routes
app.use(restrictIP);



app.use(cors())

//auth routes use
app.use('/', authRoutes);
//register routes
app.use('/', studentRoutes);
//register routes
app.use('/', adminRoutes);
//JC routes
app.use('/', jcRoutes);

app.use(express.urlencoded({ extended: true }))
// Use the cookie-parser middleware
app.use(cookieParser());
app.set("view engine", "ejs")
app.set("views", "views")

const port = process.env.PORT || 3000;





app.get("/", (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');


    res.render("homepage")

})




app.use(express.static("public"));



const server = app.listen(port, '0.0.0.0', () => {
    const { address, port } = server.address();
    console.log(`Server running at http://${address}:${port}`);
    console.log(`Server IP address: ${address}`);
});