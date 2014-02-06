var f = require('util').format,
    data = require('../../data');

// Process the province select step
module.exports = function(interview, input, number, strings) {
    var message = '';
    
    // Confirm province choice
    if (input.toLowerCase() === strings.yes) {
        interview.provinceFound = true;
        interview.step = 'city';
        message = f(strings.provinceFound, interview.matchedProvince, data.getExampleMuni(interview.matchedProvince));
    } else {
        interview.provinceFound = false;
        interview.matchedProvince = null;
        interview.enteredProvince = null;
        interview.step = 'province';
        message = f(i18n(interview.language).province, 'Iloilo');
    }

    return message;
};