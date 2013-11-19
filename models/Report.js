// Setup Mongoose ODM
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOHQ_URL);

// Model object for an incident report
var reportSchema = new mongoose.Schema({
    date: { 
        type: Date, 
        default: Date.now 
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
    locationFailed:Boolean,
    problemType:String,
    problemDetail:String,
    howMany:String,
    canContact:Boolean,
    comment:String
});

// Create Mongoose model and export
var Report = mongoose.model('Report', reportSchema);
module.exports = Report;