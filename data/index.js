// A node.js implementation of the L-diggity
var Levenshtein = require('levenshtein');

// Load in pre-generated Philippines location data
var provinces = require('./villages.json');
exports.provinces = provinces;

// Get the closest levenshtein value, given a list of values
function getClosest(input, possibleValues) {
    var bestMatch = null, currentDistance = null;

    for (var i = 0, l = possibleValues.length; i<l; i++) {
        var possibleValue = possibleValues[i];
        if (!bestMatch) {
            bestMatch = possibleValue;
            currentDistance = new Levenshtein(
                possibleValue.toLowerCase(), 
                input.toLowerCase()
            );
        } else {
            var lev = new Levenshtein(
                possibleValue.toLowerCase(), 
                input.toLowerCase()
            );

            // Test the distance of the current string
            if (lev.distance === 0) {
                //exact match
                bestMatch = possibleValue;
                break;
            } else {
                if (lev.distance < currentDistance.distance) {
                    bestMatch = possibleValue;
                    currentDistance = lev;
                }
            }
        }
    }

    return bestMatch;
}
exports.getClosest = getClosest;

// Get the closest province name to the entered string
exports.getClosestProvince = function(input) {
    return getClosest(input, Object.keys(provinces));
};

// Get the closest city name to the entered string
exports.getClosestCity = function(province, input) {
    return getClosest(input, Object.keys(provinces[province].munis));
};

// Get the closest barangay name to the entered string
exports.getClosestBarangay = function(province, city, input) {
    return getClosest(input, Object.keys(provinces[province].munis[city].barangays));
};