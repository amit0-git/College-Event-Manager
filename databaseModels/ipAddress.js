const mongoose = require('mongoose');


const ipSchema = new mongoose.Schema({
  ip: {
    type: String,
    required:true
  },
  pcname:  {
    type: String,
    required:true
 
  }
});



module.exports = mongoose.model('allowedIP', ipSchema);