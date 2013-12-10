module.exports = function(request, response) {
    console.log('Chikka Inbound SMS\n**********************');
    console.log(request);
    response.send('Accepted');
};