var mongoose = require('mongoose'),
    util = require('util'),
    data = require('../data'),
    ushahidi = require('ushahidi');

// Create a Ushahidi client to submit reports for visualization
ushahidi.init(
    process.env.USHAHIDI_URL,
    process.env.USHAHIDI_USER,
    process.env.USHAHIDI_PASSWORD
);

// Model object for an incident report
var reportSchema = new mongoose.Schema({
    date: { 
        type: Date, 
        default: Date.now 
    },
    reporterHash:String,
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
    comment:String,
    lat:Number,
    lng:Number
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
        incident_description:this.comment +'. Persons affected: '+ this.howMany,
        incident_date:util.format('%d/%d/%d', 
            this.date.getMonth()+1, 
            this.date.getDate(), 
            this.date.getFullYear()),
        incident_hour: (this.date.getHours() < 12) ? this.date.getHours()+1 : this.date.getHours()-11,
        incident_minute: this.date.getMinutes(),
        incident_ampm: (this.date.getHours() < 12) ? 'am' : 'pm',
        incident_category: categories[this.problemType],
        location_name: util.format('Province: %s, Municipality: %s, Barangay: %s, Village/Island: %s', 
            this.matchedProvince||'Unknown',
            this.matchedCity||'Unknown',
            this.matchedBarangay||'Unknown',
            this.matchedVillage||'Unknown'),
        latitude:this.lat,
        longitude:this.lng
    };

    // Use the ushahidi client to submit a report
    ushahidi.submitReport(reportData,function(data) {
        console.log('Ushahidi report submitted: '+JSON.stringify(data, null, 2));
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