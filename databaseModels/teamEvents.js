const mongoose = require('mongoose');

//COUNT SCHEMA
const Count = require("./count")


const teamSchema = new mongoose.Schema({

    tid: {
        type: String,
        required: true,
        unique: true
    },
    
    name:{

        type:String,
        required:false
    },


    event: {
        type: String,
        required: true
    },

    members: {
        type: [String],
        required: true
    }
});




teamSchema.pre("save", async function (next) {
    try {
        const prevCount = await Count.findOne({ name: "lastCount" });

        if (prevCount) {
            // Increment count if the document exists
            const val = prevCount.count + 1;

            try {
                const result = await Count.updateOne(
                    { name: "lastCount" }, // Match criteria
                    { $set: { count: val } } // Update values
                );

                if (result && result.modifiedCount === 1) {
                    console.log('Last Count Team updated successfully');
                } else {
                    console.log('Last Count Team not found or not updated');
                }
            } catch (err) {
                console.error(err);
            }
        } else {
            // Create a new document if 'lastCount' document doesn't exist
            const cc = new Count({
                name: "lastCount",
                count: 1
            });

            await cc.save();
        }

        next(); // Call next after processing
    } catch (error) {
        console.log(error);
        next(error);
    }
});


// teamSchema.pre("save", async function (next) {

//     try {

//         const prevCount = await Count.findOne({ name: "lastCount" })

//         if (prevCount) {
//             //if the prevCount Value is present then increment it

//             const val = prevCount.count

//             try {
//                 const result = await Count.updateOne(
//                   { name: "lastCount"}, // Match criteria
//                   { $set: { count: val+1} } // Update values
//                 );
            
//                 if (result.nModified === 1) {
//                   console.log('Document updated successfully');
//                 } else {
//                   console.log('Document not found or not updated');
//                 }
//               } catch (err) {
//                 console.error(err);
//               }

//             next();
//         }
//         else {

//             //if the value of the last count is not present then add 1

//             const cc = new Count({
//                 name: "lastCount",
//                 count: 1

//             })

//             await cc.save().catch((error) => {
//                 console.log(error);
//             })

            
//         }



//         next();
//     }

//     catch (error) {
//         console.log(error);
//         next(error);
//     }

// })





module.exports = mongoose.model('teamEvents', teamSchema,'teamEvents');