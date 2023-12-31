const mongoose = require('mongoose');
const bcrypt = require("bcrypt")


const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required:true
  },
  password:  {
    type: String,
    required:true
  },
  role:{
    type:String,
    required:true,

  }
});







userSchema.pre("save", async function (next) {
  //middleware to hash the password before savingto the db

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);

    this.password = hashedPassword;
    next();
  }

  catch (error) {
    console.log(error);
    next(error);
  }

})

module.exports = mongoose.model('members', userSchema);