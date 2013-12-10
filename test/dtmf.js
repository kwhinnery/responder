var dtmf = require('../data/dtmf');

var results = [];
dtmf.possibleStrings('223#', results);
console.log(results);