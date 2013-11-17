var fs = require('fs'),
    path = require('path'),
    csv = require('node-csv'),
    Levenshtein = require('levenshtein');

// Keep an in-memory representation of the administrative areas of the
// Philippines, to eventually write out to JSON
var provinces = {}, lineCount = 0;

// Ultimately write the geo data structure out to a JSON file
function writeJson() {
    var outputPath = path.join(__dirname, 'villages.json'),
        str = JSON.stringify(provinces, null, 2);

    fs.writeFile(outputPath, str, function(error) {
        if (error) {
            console.error('Error writing JSON output: '+error);
        } else {
            console.log('Wrote output to '+outputPath);
        }
    });
}

// Parse in lat/long and additional data for cities
function processCities(citiesCallback) {
    var first = false;
    csv.each(path.join(__dirname, 'ADM2centroids.csv')).on('data', function(data) {
        if (first) {
            first = false;
            return;
        }

        // First, ensure we have the province in memory
        var province = data[4];
        if (!provinces[province]) {
            provinces[province] = {
                lat:false,
                lng:false,
                munis: {}
            };
        }

        // Now, access/process the city/municipality, for which we have lat/long
        var muni = data[6];
        if (!provinces[province].munis[muni]) {
            provinces[province].munis[muni] = {
                barangays: {}
            };
        }
        provinces[province].munis[muni].lat = data[18];
        provinces[province].munis[muni].lng = data[19];
    })
    .on('end', citiesCallback)
    .on('error', citiesCallback);
}

// Parse in lat/long for Barangays
function processBarangays(barangaysCallback) {
    var first = false;
    csv.each(path.join(__dirname, 'ADM3centroids.csv')).on('data', function(data) {
        if (first) {
            first = false;
            return;
        }

        // First, ensure we have the province in memory
        var province = data[4];
        if (!provinces[province]) {
            provinces[province] = {
                lat:false,
                lng:false,
                munis: {}
            };
        }

        // Ensure we have the city/municipality
        var muni = data[6];
        if (!provinces[province].munis[muni]) {
            provinces[province].munis[muni] = {
                lat:false,
                lng:false,
                barangays: {}
            };
        }

        var barangay = data[8];
        if (!provinces[province].munis[muni].barangays[barangay]) {
            provinces[province].munis[muni].barangays[barangay] = {
                villages: {}
            };
        }
        provinces[province].munis[muni].barangays[barangay].lat = data[19];
        provinces[province].munis[muni].barangays[barangay].lng = data[20];
    })
    .on('end', barangaysCallback)
    .on('error', barangaysCallback);
}

// Read in village data on module load
csv.each(path.join(__dirname, 'VillagesADM3.csv')).on('data', function(data) {
    lineCount++;
    if (lineCount === 1) {
        //skip headers
        return;
    }

    // First, ensure we have the province in memory
    var province = data[7];
    province = province||'None';
    if (!provinces[province]) {
        provinces[province] = {
            lat:false, //TODO: Add Lat/Lng for province to CSV
            lng:false,
            munis: {}
        };
    }

    // Now, process the city/municipality
    var muni = data[9];
    muni = muni||'None';
    if (!provinces[province].munis[muni]) {
        provinces[province].munis[muni] = {
            lat:false, //TODO: Add Lat/Lng for muni to CSV
            lng:false,
            barangays: {}
        };
    }

    // Now, the barangay (~neighborhood)
    var barangay = data[11];
    barangay = barangay||'None';
    if (!provinces[province].munis[muni].barangays[barangay]) {
        provinces[province].munis[muni].barangays[barangay] = {
            lat:false, //TODO: Add Lat/Lng for barangay to CSV
            lng:false,
            villages:{}
        };
    }

    // Now, village name, for which we do currently have lat/long
    var village = data[1];
    if (!provinces[province].munis[muni].barangays[barangay].villages[village]) {
        provinces[province].munis[muni].barangays[barangay].villages[village] = {
            lat:data[5],
            lng:data[4]
        };
    }
}).on('end', function() {
    processCities(function(citiesError) {
        if (citiesError) {
            console.error('There was a problem parsing city/municipality data: '+citiesError);
        } else {
            processBarangays(function(barangaysError) {
                if (barangaysError) {
                    console.error('There was a problem parsing barangay data: '+barangaysError);
                } else {
                    console.log('[data]: Read in %d lines from VillagesADM3.csv', lineCount);
                    console.log('[data]: Total Provinces: '+Object.keys(provinces).length);
                    writeJson();
                }
            });
        }
    });
}).on('error', function(err) {
    console.error('Problem reading in geo data: ' + err);
});
