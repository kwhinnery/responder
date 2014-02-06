var twilio = require('twilio');

// Express route handler
module.exports = function(request, response) {
    // Setup TwiML response
    var twiml = new twilio.TwimlResponse();

    // Send back the proper TwiML
    var twiml = new twilio.TwimlResponse();
    twiml.say('Please send an SMS text message to this number to receive information on TB medication. Thank you!', {
        voice:'woman'
    });
    response.type('text/xml');
    response.send(twiml.toString());
};