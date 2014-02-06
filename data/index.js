var Levenshtein = require('levenshtein'),
    geolib = require('geolib');

// Load in pre-generated Philippines location data
var provinces = require('./villages.json'),
    clinics = require('./clinics.json');

exports.provinces = provinces;
exports.clinics = clinics;

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

// Get the closest village name to the entered string
exports.getClosestVillage = function(province, city, barangay, input) {
    return getClosest(input, Object.keys(provinces[province].munis[city].barangays[barangay].villages));
};

// Return the first city for a matched province
exports.getExampleMuni = function(province) {
    for (var muni in provinces[province].munis) {
        if (provinces[province].munis.hasOwnProperty(muni)) {
            return muni;
        }
    }
};

// Return the first barangay for a matched city
exports.getExampleBarangay = function(province, muni) {
    for (var barangay in provinces[province].munis[muni].barangays) {
        if (provinces[province].munis[muni].barangays.hasOwnProperty(barangay)) {
            if (barangay !== 'Poblacion') {
                return barangay;
            }
        }
    }
};

// Get the closest clinic, based on the matched barangay
// Obviously, this should be optimized ot not have to loop through all 6,000
// some odd clinics, but since it's in memory it's pretty fast
exports.getClosestClinic = function(barangayLat, barangayLong) {
    var closestClinic, bestDistance;
    for (var clinic in clinics) {
        var distance = geolib.getDistance({
            latitude:barangayLat,
            longitude:barangayLong
        }, clinics[clinic]);

        if (!bestDistance || distance < bestDistance) {
            bestDistance = distance;
            closestClinic = clinic;
        }
    }

    return closestClinic;
};