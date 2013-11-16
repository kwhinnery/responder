var twilio = require('twilio'),
    path = require('path'),
    util = require('util'),
    csv = require('node-csv'),
    cookie = require('cookie'),
    Levenshtein = require('levenshtein'),
    i18n = require('../i18n');

// When the node process fires up, read in administrative data from the CSVs
var villages = [];

// Read in village data
csv.each(path.join(process.cwd(), 'data', 'villages.csv'))
    .on('data', function(data) {
        villages.push(data);
    }).on('end', function() {
        console.log('Read in %d lines from villages.csv', villages.length);
    }).on('error', function(err) {
        console.error('Problem reading in villages data: '+error);
    });

// set an SMS state cookie
function setCookie(response, data) {
    response.cookie('sms', JSON.stringify(data), { maxAge: 9000000 });
}

// Express route handler
module.exports = function(request, response) {
    if (request.param('secret') !== process.env.TWILIO_SECRET) {
        response.send(403, 'You are not Twilio... >:/');
    } else {
        // Setup TwiML response
        var twiml = new twilio.TwimlResponse(),
            smsResponse = '';
        response.type('text/xml');

        // Determine if we have current conversation state
        var smsCookie;
        if (request.headers.cookie) {
            var cookies = cookie.parse(request.headers.cookie);
            smsCookie = JSON.parse(cookies.sms);
        }

        if (smsCookie && smsCookie.step > 0) {
            // Get SMS body to process
            var body = request.param('Body').trim();

            // First, prompt for village
            if (smsCookie.step === 1) {
                smsCookie.language = (body.toLowerCase() === 'pilipino') ? 'tl' : 'en';
                var strings = i18n(smsCookie.language);
                smsResponse = strings.welcome + ' ' + strings.village;

                // setup cookie for next phase of questioning
                smsCookie.step++;
                setCookie(response, smsCookie);
            } else if (smsCookie.step === 2) {
                try {
                    // See if we can establish the village from our list in the CSV
                    // Go through and find the best match - break 
                    var bestMatch = null, currentDistance = null;
                    for (var i = 0, l = villages.length; i<l; i++) {
                        var villageData = villages[i];
                        if (!bestMatch) {
                            bestMatch = villageData;
                            currentDistance = new Levenshtein(
                                villageData[0].toLowerCase(), 
                                body.toLowerCase()
                            );
                        } else {
                            var villageName = villageData[0].toLowerCase();
                            var lev = new Levenshtein(
                                villageData[0].toLowerCase(), 
                                body.toLowerCase()
                            );

                            // Test the distance of the current village string
                            if (l.distance === 0) {
                                //exact match
                                bestMatch = villageData;
                                break;
                            } else {
                                if (lev.distance < currentDistance.distance) {
                                    bestMatch = villageData;
                                    currentDistance = lev;
                                }
                            }
                        }
                    }

                    // Formulate SMS response
                    var strings = i18n(smsCookie.language);
                    smsResponse = util.format(strings.didYouMeanVillage, bestMatch[0]);
                    
                    // setup cookie for next phase of questioning
                    smsCookie.step++;
                    smsCookie.submittedVillage = body;
                    smsCookie.candidateVillage = bestMatch;
                    setCookie(response, smsCookie);
                } catch(e) {
                    console.error(e);
                }
            } else if (smsCookie.step === 3) {
                // Identify issue type, regardless of whether the village capture
                // succeeded
                var strings = i18n(smsCookie.language);
                if (body.toLowerCase() === 'yes') {
                    smsCookie.villageAccepted = true;
                    smsResponse = util.format(strings.villageSuccess, smsCookie.candidateVillage[0]);
                } else {
                    smsCookie.villageAccepted = false;
                    smsResponse = util.format(strings.villageFail);
                }
                smsResponse = smsResponse+' '+strings.typeOfIssue;

                smsCookie.step++;
                setCookie(response, smsCookie);
            } else {
                // We're done - hit the ushahidi API and peace out...
                var strings = i18n(smsCookie.language);
                smsResponse = strings.thanks;
                setCookie(response, {step:0});
            }
        } else {
            // Else, prompt them to begin the interview, and update conversation state
            smsResponse = 'Thanks for contacting Doctors Without Borders. To continue in English, text the word "English". Upang magpatuloy sa Filipino, text ang salitang "Pilipino"';
            setCookie(response, {step:1});
        }

        // Send back the proper TwiML
        twiml.message(smsResponse);
        response.send(twiml.toString());
    }
};