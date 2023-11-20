const mongoose = require('mongoose');

//COUNT SCHEMA
//const Count = require("./count")


const tyroSchema = new mongoose.Schema({

    rollno: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    }
});



module.exports = mongoose.model('tyro', tyroSchema,"tyro");