const mongoose = require('mongoose');
const bcrypt = require("bcrypt")

//COUNT SCHEMA
const Count = require("./count")

const individualSchema = new mongoose.Schema({

    pid: {
        type: String,
        required: true
    },
    rollno: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,

    },
    college: {
        type: String,
        required: true
    }
    ,
    branch: {
        type: String,
        required: true
    },
    year:{
        type:Number,
        required:true
    },
    singleEvent:{
        type:[String]
    }
});





//pre hook to increment the value of lastCount table before any save request is made on individualEvent

individualSchema.pre("save", async function (next) {

    try {

        const prevCount = await Count.findOne({ name: "lastCount" })

        if (prevCount) {
            //if the prevCount Value is present then increment it

            const val = prevCount.count

            try {
                const result = await Count.updateOne(
                  { name: "lastCount"}, // Match criteria
                  { $set: { count: val+1} } // Update values
                );
            
                if (result.nModified === 1) {
                  console.log('Document updated successfully');
                } else {
                  console.log('Document not found or not updated');
                }
              } catch (err) {
                console.error(err);
              }

            next();
        }
        else {
            //if the record is not found then save the value of last count as 1

            const cc = new Count({
                name: "lastCount",
                count: 1

            })

            await cc.save().catch((error) => {
                console.log(error);
            })

            
        }



        next();
    }

    catch (error) {
        console.log(error);
        next(error);
    }

})





module.exports = mongoose.model('individualEvents', individualSchema,'individualEvents');