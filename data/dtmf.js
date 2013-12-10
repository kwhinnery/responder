// International Standard Keys
var keys = {
    '1':'1',
    '2':'abc',
    '3':'def',
    '4':'ghi',
    '5':'jkl',
    '6':'mno',
    '7':'pqrs',
    '8':'tuv',
    '9':'wxyz',
    '0':'0',
    '#':'#',
    '*':'*'
};

function possibleStrings(input, output, current) {
    var currentString = current||'';

    var digit = input.substring(0,1),
        other = input.substring(1),
        chars = keys[digit].split('');

    chars.forEach(function(character) {
        if (!other) {
            output.push(currentString+character);
        } else {
            possibleStrings(other, output, currentString+character);
        }
    });
}
exports.possibleStrings = possibleStrings;