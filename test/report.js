var data = require('../data'),
    Report = require('../models/Report'),
    mongoose = require('mongoose');

Report.find({}, function(err, reports) {
    report = reports[0];
    console.log(report);
    report.exportToUshahidi();
});