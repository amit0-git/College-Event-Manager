const express = require("express")
const mongoose = require("mongoose")
const cookieParser = require('cookie-parser');

const cors = require('cors');






//modules 
const authRoutes = require('./modules/auth');
const studentRoutes = require('./modules/studentRegister');
const adminRoutes = require('./modules/admin');
const jcRoutes=require("./modules/judgement")

//USER SCHEMA
const User = require("./databaseModels/user")

require('dotenv').config()


//mongodb connection
mongoose.connect('mongodb://127.0.0.1:27017/users');


app = express()




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





app.get("/",(req,res)=>{
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
   

    res.render("homepage")

})


app.use(express.static("public"));



const server = app.listen(port, '0.0.0.0',() => {
    const { address, port } = server.address();
    console.log(`Server running at http://${address}:${port}`);
    console.log(`Server IP address: ${address}`);
  });