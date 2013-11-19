var data = require('../data'),
    Report = require('../models/Report'),
    mongoose = require('mongoose');

Report.find({}, function(err, reports) {
    report = reports[1];
    report.exportToUshahidi();
    mongoose.connection.close();

    Report.find({}, function(err, reports) {
        report = reports[2];
        report.exportToUshahidi();
        mongoose.connection.close();
    });
});

