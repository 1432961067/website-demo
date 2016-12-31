
var mongoose = require('mongoose');
var ObjectId=mongoose.Schema.Types.ObjectId;

var CategorySchema = new mongoose.Schema({
    name:String,
    movies:[{type:ObjectId,ref:'Movie'}]
});


module.exports = CategorySchema;
