var f = require('util').format,
    data = require('../../data');

// Process the province select step
module.exports = function(interview, input, number, strings) {
    var message = '';
    interview.enteredProvince = input;
    interview.matchedProvince = data.getClosestProvince(input);
    
    // Check for an exact match
    if (interview.enteredProvince.toLowerCase() === interview.matchedProvince.toLowerCase()) {
        interview.provinceFound = true;
        interview.step = 'city';
        message = f(strings.provinceFound, interview.matchedProvince, data.getExampleMuni(interview.matchedProvince));
    } else {
        interview.step = 'province3';
        message = f(strings.matchConfirm, interview.matchedProvince, strings.yes, strings.no);
    }

    return message;
};