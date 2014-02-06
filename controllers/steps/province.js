var data = require('../../data'),
    i18n = require('../../i18n'),
    f = require('util').format;

// Process the province select step
module.exports = function(interview, input, number, strings) {
    if (!interview.retry) {
        var lang = 'en';

        if (input === '2') {
            lang = 'war';
        } else if (input === '3') {
            lang = 'tl';
        }

        interview.language = lang;
    } else {
        interview.retry = false;
    }

    interview.step = 'province2';
    return f(i18n(interview.language).province, 'Iloilo');
};