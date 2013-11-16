// Configure application routes
module.exports = function(app) {
    // Twilio SMS webhook
    app.post('/sms', require('./sms'));
};