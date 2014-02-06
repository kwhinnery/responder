var bcrypt = require('bcrypt'),
    Interview = require('../models/Interview'),
    i18n = require('../i18n');

// use a pre-generated salt so it's consistent across app launches,
// TODO: make this configureable and take it out of source
var salt = '$2a$10$JFPdjNEzls1zPBf8rc4mLu';

// Conduct the next step of the interview, based on current saved state and
// the responder's phone number
module.exports = function(input, number, callback) {
    // Get the hash of this user's phone number
    var phoneHash = bcrypt.hashSync(number, salt);
    console.log(phoneHash);

    // Get the interview associated with this hash, if it exists
    Interview.findOne({
        reporterHash:phoneHash
    }, function(err, foundInterview) {
        var inputLower = input ? input.toLowerCase() : '',
            interview = foundInterview;

        // Continue an existing interview or create a new one
        if (!interview || inputLower === 'start over') {
            interview = foundInterview || new Interview({
                step:'start',
                complete:false,
                reporterHash:phoneHash,
                language:'en'
            });
        }

        // Load up the proper i18n strings based on selected language
        var strings = i18n(interview.language);

        // process the interview at the proper step
        var interviewStep;
        try {
            interviewStep = require('./steps/'+interview.step);
        } catch(e) {
            console.error('Invalid step specified: %s', interview.step);
            return callback(true, 'Invalid interview step specified.');
        }

        // Get the next user message if we have one.
        var lastMessage = interviewStep(interview, inputLower, number, strings);

        // save updated interview state
        interview.save(function(err) {
            callback(err, lastMessage);
        });
    });
};