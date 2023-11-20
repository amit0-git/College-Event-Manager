const mongoose = require('mongoose');


const eventSchema = new mongoose.Schema({
  event: {
    type: String,
    required:true
  },
  description:  {
    type: String
 
  },
  type:{
    type:String,
    required:true,

  },
  venue:{
    type:String
    
  },
  time:{
    type:String
  },
  limit:{
    type:Number
  }
});



module.exports = mongoose.model('events', eventSchema);