/* A Ushahidi API client for node.js */
function Client(endpoint) {
    this.endpoint = endpoint;
}

// TODO: Submit a report to the Ushahidi endpoint
Client.prototype.sendReport = function(data, callback) {
    setTimeout(callback, 1000);
};

module.exports = {
    Client: Client
};