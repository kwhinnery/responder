var twilio = require('twilio'),
    util = require('util'),
    cookie = require('cookie'),
    _ = require('underscore'),
    data = require('../data'),
    i18n = require('../i18n'),
    Report = require('../models/Report');

// Conduct an interview based on the current session state, return a message,
// And update the session state
function interview(sessionState, input, phone) {
    var state = _.extend({
        step:'start'
    },sessionState||{});

    // If we have no conversation state, give the preroll message
    if (state.step === 'start') {
        state.step = 'purposeConfirm';
        state.lastMessage = i18n('ceb').preroll;
        return state;
    }

    // Some internal functions that handle short circuits that can be called
    // from multiple points in the interview process

    function saveInterview() {
        // Add phone number to state, if they have permitted it
        if (state.canContact) {
            state.phone = phone;
        }

        // Capture the most specific lat/long we can for this report
        var reportLat, reportLng;
        if (state.matchedVillage) {
            reportLat = data.provinces[state.matchedProvince].munis[state.matchedCity].barangays[state.matchedBarangay].villages[state.matchedVillage].lat;
            reportLng = data.provinces[state.matchedProvince].munis[state.matchedCity].barangays[state.matchedBarangay].villages[state.matchedVillage].lng;
        } else if (state.matchedBarangay) {
            reportLat = data.provinces[state.matchedProvince].munis[state.matchedCity].barangays[state.matchedBarangay].lat;
            reportLng = data.provinces[state.matchedProvince].munis[state.matchedCity].barangays[state.matchedBarangay].lng;
        } else if (state.matchedCity) {
            reportLat = data.provinces[state.matchedProvince].munis[state.matchedCity].lat;
            reportLng = data.provinces[state.matchedProvince].munis[state.matchedCity].lng;
        } else if (state.matchedProvince) {
            reportLat = data.provinces[state.matchedProvince].lat;
            reportLng = data.provinces[state.matchedProvince].lng;
        }

        // Update the flow state for the Report model
        state.lat = reportLat||11.3333;
        state.lng = reportLng||123.0167;

        // Persist the report, and export to Ushahidi
        var report = new Report(state);
        report.save(function(err, report) {
            if (err) {
                console.error('Problem saving report: '+err);
                console.error('State was: '+JSON.stringify(state, null, 2));
            } else {
                console.log('Report saved.');
                report.exportToUshahidi();
            }
        });

        // Reset conversation state
        state = {step:'start'};
        state.lastMessage = strings.thanks;
    }

    // Prompt the user to free form enter their location, so a human can try
    // and locate later...
    function skipToProblem() {
        state.locationFailed = true; //flag for manual geocoding
        state.step = 'problem';
        state.lastMessage = strings.notFound +' '+ strings.problem;
    }

    // Get local strings for the default or chosen langauge

    var chosenLanguage = state.language||'ceb';
    var strings = i18n(chosenLanguage);

    // Allow start over command
    if (input.toLowerCase() === strings.startOver.toLowerCase()) {
        state = {step:'purposeConfirm'};
        state.lastMessage = state.lastMessage = i18n('en').preroll;
        return state;
    }

    // Start processing input, based on conversation state
    if (state.step === 'purposeConfirm') {
        // First, respond to their desired language choice.  Don't use default
        // chosen above, set it for the first time
        if (input.toLowerCase() === 'pilipino') {
            state.language = 'tl';
        } else if (input.toLowerCase() === 'english') {
            state.language = 'en';
        } else {
            state.language = 'ceb';
        }
        strings = i18n(state.language);

        state.step = 'province';
        state.lastMessage = util.format(strings.purposeConfirm, strings.startOver, strings.yes, strings.no);

    } else if (state.step === 'province') {

        // Opt out
        if (input.toLowerCase() === strings.no.toLowerCase()) {
            state = {
                step:'start',
                lastMessage:strings.optOut
            };

        } else {
            // Now, we need to begin by asking them for their province
            state.step = 'provinceConfirm';
            state.lastMessage = util.format(strings.province, strings.notSure);
        }

    } else if (state.step === 'provinceConfirm') {

        if (input.toLowerCase() === strings.notSure.toLowerCase()) {
            skipToProblem();
        } else {
            // Let's work with their entered province
            state.enteredProvince = input;
            state.matchedProvince = data.getClosestProvince(input);
            if (state.matchedProvince.toLowerCase() === 'none') {
                skipToProblem();
            } else {
                // Check for an exact match
                if (state.enteredProvince.toLowerCase() === state.matchedProvince.toLowerCase()) {
                    state.provinceFound = true;
                    state.step = 'city';
                    state.lastMessage = util.format(strings.provinceFound, state.matchedProvince, data.getExampleMuni(state.matchedProvince));
                } else {
                    state.step = 'provinceEntered';
                    state.lastMessage = util.format(strings.matchConfirm, state.matchedProvince, strings.yes, strings.no);
                }
            }
        }

    } else if (state.step === 'provinceEntered') {

        // Confirm province choice
        if (input.toLowerCase() === strings.yes) {
            state.provinceFound = true;
            state.step = 'city';
            state.lastMessage = util.format(strings.provinceFound, state.matchedProvince, data.getExampleMuni(state.matchedProvince));
        } else {
            skipToProblem();
        }

    } else if (state.step === 'city') {

        // Let's work with their entered city
        state.enteredCity = input;
        state.matchedCity = data.getClosestCity(state.matchedProvince, input);

        // Check for an exact match
        if (state.enteredCity.toLowerCase() === state.matchedCity.toLowerCase()) {
            state.cityFound = true;
            state.step = 'barangay';
            state.lastMessage = util.format(strings.cityFound, state.matchedCity, data.getExampleBarangay(state.matchedProvince, state.matchedCity));
        } else {
            state.step = 'cityConfirm';
            state.lastMessage = util.format(strings.matchConfirm, state.matchedCity, strings.yes, strings.no);
        }

    } else if (state.step === 'cityConfirm') {

        // Confirm city choice
        if (input.toLowerCase() === strings.yes) {
            state.cityFound = true;
            state.step = 'barangay';
            state.lastMessage = util.format(strings.cityFound, state.matchedCity, data.getExampleBarangay(state.matchedProvince, state.matchedCity));
        } else {
            skipToProblem();
        }

    } else if (state.step === 'barangay') {

        // Let's work with their entered barangay
        state.enteredBarangay = input;
        state.matchedBarangay = data.getClosestBarangay(state.matchedProvince, state.matchedCity, input);

        // Check for an exact match
        if (state.enteredBarangay.toLowerCase() === state.matchedBarangay.toLowerCase()) {
            state.barangayFound = true;
            state.step = 'village';
            state.lastMessage = util.format(strings.barangayFound, state.matchedBarangay);
        } else {
            state.step = 'barangayConfirm';
            state.lastMessage = util.format(strings.matchConfirm, state.matchedBarangay, strings.yes, strings.no);
        }

    } else if (state.step === 'barangayConfirm') {

        // Confirm barangay choice
        if (input.toLowerCase() === strings.yes) {
            state.barangayFound = true;
            state.step = 'village';
            state.lastMessage = util.format(strings.barangayFound, state.matchedBarangay);
        } else {
            skipToProblem();
        }

    } else if (state.step === 'village') {

        // Let's work with their entered village
        state.enteredVillage = input;
        state.matchedVillage = data.getClosestVillage(state.matchedProvince, state.matchedCity, state.matchedBarangay, input);

        if (!state.matchedVillage) {
            state.step = 'problem';
            state.lastMessage = strings.notFound +' '+ strings.problem;
        } else {
            state.step = 'villageConfirm';
            state.lastMessage = util.format(strings.matchConfirm, state.matchedVillage, strings.yes, strings.no);
        }

    } else if (state.step === 'villageConfirm') {

        // Confirm barangay choice
        if (input.toLowerCase() === strings.yes) {
            state.villageFound = true;
            state.lastMessage = util.format(strings.villageFound, state.matchedVillage) +' '+strings.problem;
        } else {
            state.lastMessage = strings.notFound +' '+ strings.problem;
        }

        state.step = 'problem';


    } else if (state.step == 'problem') {

        // Work with their problem input
        var problem = input.toLowerCase();
        if (problem === 'violence') {
            state.problemType = 'violence';
            state.lastMessage = strings.violence;
        } else if (problem === 'disease') {
            state.problemType = 'disease';
            state.lastMessage = strings.disease;
        } else if (problem === 'water') {
            state.problemType = 'water';
            state.lastMessage = strings.water;
        } else if (problem === 'shelter') {
            state.problemType = 'shelter';
            state.lastMessage = strings.shelter;
        } else if (problem === 'food') {
            state.problemType = 'food';
            state.lastMessage = strings.food;
        } else {
            state.problemType = 'other';
            state.lastMessage = strings.otherProblem;
        }

        state.step = 'problemDetail';

    } else if (state.step == 'problemDetail') {

        // capture problem details
        state.problemDetail = input;

        //ask for affected persons
        state.lastMessage = strings.howMany;
        state.step = 'howMany';

    } else if (state.step == 'howMany') {

        // capture how many folks are affected
        state.howMany = input; // TODO: parse a number instead?

        //ask if we can contact them
        state.lastMessage = util.format(strings.canContact, strings.yes, strings.no);
        state.step = 'captureContact';

    } else if (state.step == 'captureContact') {

        // ask if we can contact them
        if (input.toLowerCase() === strings.yes.toLowerCase()) {
            state.canContact = true;
        } else {
            state.canContact = false;
        }

        state.step = 'comment';
        state.lastMessage = strings.comment;

    } else if (state.step == 'comment') {

        // capture a free form comment
        state.comment = input;

        // That's it for now
        saveInterview();

    } else {
        // Default is to just end the interview and save what data we have
        saveInterview();
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

        // Interview the texter based on the current session state
        var smsCookie = interview(
            smsCookie, // current session state
            request.param('Body').trim(), // text message contents
            request.param('From') // phone number the caller is coming from
        );

        // Set cookie for subsequent replies
        response.cookie('sms', JSON.stringify(smsCookie), { maxAge: 9000000 });

        // Send back the proper TwiML
        var twiml = new twilio.TwimlResponse();
        twiml.message(smsCookie.lastMessage);
        response.type('text/xml');
        response.send(twiml.toString());
    }
};