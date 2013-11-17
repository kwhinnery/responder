var twilio = require('twilio');

// Express route handler
module.exports = function(request, response) {
    if (request.param('secret') !== process.env.TWILIO_SECRET) {
        response.send(403, 'You are not Twilio... >:/');
    } else {
        // Setup TwiML response
        var twiml = new twilio.TwimlResponse();

        // Send back the proper TwiML
        var twiml = new twilio.TwimlResponse();
        twiml.say('Please send an SMS text message to this number to assist the international aid response. Thank you!', {
            voice:'woman'
        });
        response.type('text/xml');
        response.send(twiml.toString());
    }
};