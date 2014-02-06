var i18n = require('../../i18n'),
    f = require('util').format;

// Process the start step
module.exports = function(interview, input, number, strings) {
    interview.step = 'province';
    return i18n('en').start;
};