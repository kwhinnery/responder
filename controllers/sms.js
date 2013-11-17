var twilio = require('twilio'),
    util = require('util'),
    cookie = require('cookie'),
    _ = require('underscore'),
    data = require('../data'),
    i18n = require('../i18n'),
    ushahidi = require('../data/ushahidi');

// Create a Ushahidi client to submit reports to the back end
var uclient = new ushahidi.Client('https://www.haiyantextforhelp.com');

// Conduct an interview based on the current session state, return a message,
// And update the session state
function interview(sessionState, input) {
    var state = _.extend({
        step:0
    },sessionState||{});

    // If we have no conversation state, give the preroll message
    if (state.step === 0) {
        state.step++;
        state.lastMessage = i18n('en').preroll;
        return state;
    }

    // Some internal functions that handle short circuits that can be called
    // from multiple points in the interview process

    // Prompt the user to free form enter their location, so a human can try
    // and locate later...
    function freeformLocation() {
        state.step = 1; // right now, short circuit back to province select
    }

    // Get local strings for the default or chosen langauge
    var chosenLanguage = state.language === 'tl' ? 'tl' : 'en';
    var strings = i18n(chosenLanguage);

    // Start processing input, based on conversation state
    if (state.step === 1) {
        // First, respond to their desired language choice.  Don't use default
        // chosen above, set it for the first time
        state.language = (input.toLowerCase() === 'pilipino') ? 'tl' : 'en';
        strings = i18n(state.language);

        // Now, we need to begin by asking them for their province
        state.step++;
        state.lastMessage = util.format(strings.province, strings.notSure);
    } else if (state.step === 2) {
        // Let's work with their entered province
        state.enteredProvince = input;
        state.matchedProvince = data.getClosestProvince(input);
        state.step++;
        state.lastMessage = util.format(strings.matchConfirm, state.matchedProvince, strings.yes, strings.no);
    } else if (state.step === 3) {
        // Confirm province choice
        if (input.toLowerCase() === strings.yes) {
            state.provinceFound = true;
            state.step++;
            state.lastMessage = util.format(strings.provinceFound, state.matchedProvince);
        } else {
            freeformLocation();
        }
    } else if (state.step === 4) {
        // Let's work with their entered city
        state.enteredCity = input;
        state.matchedCity = data.getClosestCity(state.matchedProvince, input);
        state.step++;
        state.lastMessage = util.format(strings.matchConfirm, state.matchedCity, strings.yes, strings.no);
    } else if (state.step === 5) {
        // Confirm city choice
        if (input.toLowerCase() === strings.yes) {
            state.cityFound = true;
            state.step++;
            state.lastMessage = util.format(strings.cityFound, state.matchedCity);
        } else {
            freeformLocation();
        }
    } else if (state.step === 6) {
        // Let's work with their entered barangay
        state.enteredBarangay = input;
        state.matchedBarangay = data.getClosestBarangay(state.matchedProvince, state.matchedCity, input);
        state.step++;
        state.lastMessage = util.format(strings.matchConfirm, state.matchedBarangay, strings.yes, strings.no);
    } else if (state.step === 7) {
        // Confirm barangay choice
        if (input.toLowerCase() === strings.yes) {
            state.barangayFound = true;
            state.step++;
            state.lastMessage = util.format(strings.barangayFound, state.matchedBarangay);
        } else {
            freeformLocation();
        }
    } else {
        // TODO: Save to DB, check for dupes, Submit to ushahidi

        // Reset conversation state
        state = {step:0};
        state.lastMessage = strings.thanks;
    }

    return state;
}

// Express route handler
module.exports = function(request, response) {
    if (request.param('secret') !== process.env.TWILIO_SECRET) {
        response.send(403, 'You are not Twilio... >:/');
    } else {
        // Setup TwiML response
        var twiml = new twilio.TwimlResponse();

        // Determine if we have current conversation state
        var smsCookie = null;
        if (request.headers.cookie) {
            var cookies = cookie.parse(request.headers.cookie);
            smsCookie = JSON.parse(cookies.sms);
        }

        console.log(smsCookie);

        // Interview the texter based on the current session state
        var smsCookie = interview(smsCookie, request.param('Body').trim());

        console.log(smsCookie);

        // Set cookie for subsequent replies
        response.cookie('sms', JSON.stringify(smsCookie), { maxAge: 9000000 });

        // Send back the proper TwiML
        var twiml = new twilio.TwimlResponse();
        twiml.message(smsCookie.lastMessage);
        response.type('text/xml');
        response.send(twiml.toString());
    }
};