var twilio = require('twilio'),
    interview = require('./interview');

module.exports = function(request, response) {
    function done(err, textResponse) {
        var message = textResponse;
        if (err) {
            message = 'There was a problem processing your message, please retry.';
        }

        // Send back the proper TwiML
        var twiml = new twilio.TwimlResponse();
        twiml.message(message);
        response.send(twiml);
    }

    // Interview the texter based on the saved state of the conversation,
    // keyed by a hash of their telephone number
    interview(
        request.param('Body').trim(), // text message contents
        request.param('From'), // phone number the caller is coming from
        done
    );
};