var data = require('../../data'),
    f = require('util').format;

module.exports = function(interview, input, number, strings) {
    var message = '';

    interview.enteredBarangay = input;
    interview.matchedBarangay = data.getClosestBarangay(interview.matchedProvince, interview.matchedCity, input);
    interview.retry = false;

    // Check for an exact match
    if (interview.enteredBarangay.toLowerCase() === interview.matchedBarangay.toLowerCase()) {
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
        interview.step = 'barangay2';
        message = f(strings.matchConfirm, interview.matchedBarangay, strings.yes, strings.no);
    }

    return message;
};