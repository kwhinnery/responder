var data = require('../../data'),
    f = require('util').format;

module.exports = function(interview, input, number, strings) {
    var message = '';

    interview.enteredCity = input;
    interview.matchedCity = data.getClosestCity(interview.matchedProvince, input);
    interview.retry = false;

    // Check for an exact match
    if (interview.enteredCity.toLowerCase() === interview.matchedCity.toLowerCase()) {
        interview.cityFound = true;
        interview.step = 'barangay';
        message = f(strings.cityFound, interview.matchedCity, data.getExampleBarangay(interview.matchedProvince, interview.matchedCity));
    } else {
        interview.step = 'city2';
        message = f(strings.matchConfirm, interview.matchedCity, strings.yes, strings.no);
    }

    return message;
};