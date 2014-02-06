var twilio = require('twilio');

// Configure application routes and middleware
module.exports = function(app) {
    // Twilio webhooks
    app.post('/sms', twilio.webhook(), require('./sms'));
    app.post('/voice', require('./voice'));
    app.post('/chikka/sms', require('./chikka_mo'));
};