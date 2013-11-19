var util = require('util'),
    data = require('../data'),
    ushahidi = require('ushahidi');

// Create a Ushahidi client to submit reports to the back end
ushahidi.init('https://www.haiyantextforhelp.com/index.php/api');

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
    enteredVillage:String,
    matchedVillage:String,
    villageFound:Boolean,
    locationFailed:Boolean,
    problemType:String,
    problemDetail:String,
    howMany:String,
    canContact:Boolean,
    comment:String
});

// Ushahidi categories
var categories = {
    water:1,
    food:2,
    disease:3,
    violence:6,
    other:7,
    shelter:8
};

// Based on report properties, submit a report to Ushahidi
reportSchema.methods.exportToUshahidi = function(cb) {
    var self = this, reportData = {
        incident_title:'[SMS Report]: '+this.problemDetail,
        incident_description:this.comment,
        incident_date:util.format('%d/%d/%d', 
            this.date.getMonth()+1, 
            this.date.getDate(), 
            this.date.getFullYear()),
        incident_hour: (this.date.getHours() < 12) ? this.date.getHours() : this.date.getHours()-12,
        incident_minute: this.date.getMinutes(),
        incident_ampm: (this.date.getHours() < 12) ? 'am' : 'pm',
        incident_category: categories[this.problemType],
        location_name: util.format('Province: %s, Municipality: %s, Barangay: %s, Village/Island: %s', 
            this.matchedProvince||'Unknown',
            this.matchedCity||'Unknown',
            this.matchedBarangay||'Unknown',
            this.matchedVillage||'Unknown')
    };

    // Determine the best lat/long we can use
    var lat = 11.3333, lng = 123.0167;
    if (this.matchedVillage) {
        lat = data.provinces[this.matchedProvince].munis[this.matchedCity].barangays[this.matchedBarangay].villages[this.matchedVillage].lat;
        lng = data.provinces[this.matchedProvince].munis[this.matchedCity].barangays[this.matchedBarangay].villages[this.matchedVillage].lng;
    } else if (this.matchedBarangay) {
        lat = data.provinces[this.matchedProvince].munis[this.matchedCity].barangays[this.matchedBarangay].lat;
        lng = data.provinces[this.matchedProvince].munis[this.matchedCity].barangays[this.matchedBarangay].lng;
    } else if (this.matchedCity) {
        lat = data.provinces[this.matchedProvince].munis[this.matchedCity].lat;
        lng = data.provinces[this.matchedProvince].munis[this.matchedCity].lng;
    }
    // TODO: we still need province lat/longs

    reportData.latitude = lat;
    reportData.longitude = lng;

    console.log(reportData.latitude);
    console.log(reportData.longitude);

    // Use the ushahidi client to submit a report
    ushahidi.submitReport(reportData,function(data) {
        console.log(data);
        cb && cb(null, data);
    }, function (error) {
        console.error('Error submitting report to Ushahidi: '+error);
        console.error('Report is: '+self);
        cb && cb(error);
    });
};

// Create Mongoose model and export
var Report = mongoose.model('Report', reportSchema);
module.exports = Report;