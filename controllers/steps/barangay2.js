var data = require('../../data'),
    f = require('util').format;

module.exports = function(interview, input, number, strings) {
    var message = '';

    // Confirm province choice
    if (input.toLowerCase() === strings.yes) {
        interview.barangayFound = true;
        interview.step = 'start';

        // Find the closest clinic based on barangay
        var reportLat = data.provinces[interview.matchedProvince].munis[interview.matchedCity].barangays[interview.matchedBarangay].lat;
        var reportLng = data.provinces[interview.matchedProvince].munis[interview.matchedCity].barangays[interview.matchedBarangay].lng;
        var clinic = data.getClosestClinic(reportLat, reportLng);

        interview.lat = reportLat;
        interview.lng = reportLng;

        message = f(strings.barangayFound, clinic);
    } else {
        interview.barangayFound = false;
        interview.matchedBarangay = null;
        interview.enteredBarangay = null;
        interview.step = 'barangay';
        message = f(strings.cityFound, interview.matchedCity, data.getExampleBarangay(interview.matchedProvince, interview.matchedCity));
    }

    return message;
};