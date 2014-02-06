var data = require('../../data'),
    f = require('util').format;

module.exports = function(interview, input, number, strings) {
    var message = '';

    // Confirm province choice
    if (input.toLowerCase() === strings.yes) {
        interview.cityFound = true;
        interview.step = 'barangay';
        message = f(strings.cityFound, interview.matchedCity, data.getExampleBarangay(interview.matchedProvince, interview.matchedCity));
    } else {
        interview.cityFound = false;
        interview.matchedCity = null;
        interview.enteredCity = null;
        interview.step = 'city';
        message = f(strings.provinceFound, interview.matchedProvince, data.getExampleMuni(interview.matchedProvince));
    }

    return message;
};