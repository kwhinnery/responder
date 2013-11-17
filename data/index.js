// Load in pre-generated Philippines location data
var provinces = require('./villages.json');

// Get a list of all recorded provinces 
exports.getProvinces = function() {
    return Object.keys(provinces);
};