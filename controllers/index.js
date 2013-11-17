// Configure application routes
module.exports = function(app) {
    // Twilio webhooks
    app.post('/sms', require('./sms'));
    app.post('/voice', require('./voice'));
};