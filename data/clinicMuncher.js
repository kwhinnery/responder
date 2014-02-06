var fs = require('fs'),
    path = require('path'),
    csv = require('node-csv');

// Keep an in-memory representation of the administrative areas of the
// Philippines, to eventually write out to JSON
var clinics = {}, lineCount = 0;

// Ultimately write the geo data structure out to a JSON file
function writeJson() {
    var outputPath = path.join(__dirname, 'clinics.json'),
        str = JSON.stringify(clinics, null, 2);

    fs.writeFile(outputPath, str, function(error) {
        if (error) {
            console.error('Error writing JSON output: '+error);
        } else {
            console.log('Wrote output to '+outputPath);
        }
    });
}

// Read in village data on module load
csv.each(path.join(__dirname, 'clinics.csv')).on('data', function(data) {
    lineCount++;
    if (lineCount === 1) {
        //skip headers
        return;
    }

    var clinicKey = data[2]+' ('+data[0]+')',
        clinicLat = data[13],
        clinicLng = data[14];

    if (clinicKey && clinicLng && clinicLat && 
        !isNaN(parseFloat(clinicLng)) && !isNaN(parseFloat(clinicLat))) {
        clinics[clinicKey] = {
            latitude:clinicLat,
            longitude:clinicLng
        };
    }
    
}).on('end', function() {
    writeJson();
    console.log('[data]: Data Crunching Complete: Total Clinics: '+Object.keys(clinics).length);
}).on('error', function(err) {
    console.error('Problem reading in geo data: ' + err);
});
