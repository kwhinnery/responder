var mongoose = require('mongoose'),
    util = require('util');

// Model object for an incident report
var interviewSchema = new mongoose.Schema({
    step:String,
    complete:Boolean,
    retry:Boolean,
    reporterHash:{ 
        type:String, 
        required:true, 
        index: { unique:true } 
    },
    phone:String,
    language:String,
    enteredProvince:String,
    matchedProvince:String,
    provinceFound:Boolean,
    enteredCity:String,
    matchedCity:String,
    cityFound:Boolean,
    enteredBarangay:String,
    matchedBarangay:String,
    barangayFound:Boolean,
    enteredVillage:String,
    matchedVillage:String,
    villageFound:Boolean,
    takingMedication:Boolean,
    outOfMedication:Boolean,
    canContact:Boolean,
    name:String,
    lat:Number,
    lng:Number
});

// Create Mongoose model and export
var Interview = mongoose.model('Interview', interviewSchema);
module.exports = Interview;