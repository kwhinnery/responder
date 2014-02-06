// Doing comma first because the lines are so freaking long :-(
module.exports = {

    // WHO app strings
    matchConfirm: '[war] We thought you said "%s". Is that right? (Text "%s" or "%s")'

    // interview steps
    , start: '[war] For TB information in English, text "1". [waray]For TB information in Waray, text "2". [fil]For TB information in Pilipino, text "3"'
    , province: '[war] Thank you for contacting the TB information line. What province are you in (Example: %s)?'
    , provinceFound: '[war] Great, you are in %s. What city/municipality are you in? (Example: "%s")'
    , cityFound: '[war] Great, you are in %s. What barangay are you in? (Example: "%s")'
    , barangayFound: '[war] Based on what you have told us, your nearest TB treatment center is %s'

    // This will be the same for both languages:
    , preroll:'[war] Thank you for assisting international aid efforts!  To continue in English, text the word "English". Upang magpatuloy sa Filipino, text ang salitang "Pilipino"'
    
    // These are pre-localized responses for questions
    , yes:'yes'
    , no:'no'
    , notSure: 'not sure'
    , startOver: 'start over'

    // This is for strings that are shown to the user
    /*
    , optOut: 'Okay, thank you - please contact local authorities for any emergency needs.'
    , notFound: 'We could not find that location, but that is fine. You can tell us where you are in your own words at the end of the survey.'
    , matchConfirm: 'We thought you said "%s". Is that right? (Text "%s" or "%s")'
    , purposeConfirm: 'Your report will help international aid workers understand current areas of need. If you need help right now, please contact local authorities. To start over at any time, text "%s". Continue? (Text "%s" or "%s")'
    //, province: 'Great, we are going to ask you a few questions.  If you don\'t know the answer, type "%s". What province are you in? (Example: "Iloilo")'
    , provinceFound: 'Great, you are in %s. What city/municipality are you in? (Example: "%s")'
    , cityFound: 'Great, you are in %s. What barangay are you in? (Example: "%s")'
    , barangayFound: 'Great, you are in %s. Can you tell us the name of your town or village?'
    , villageFound: 'Great, you are in %s.'
    , problem: 'What sort of problem do you see in your community? Text "Disease", "Water", "Food", "Shelter", "Violence", or "Other".'
    , disease: 'What kind of symptoms are you seeing? (Examples: Diarrhoea, Fever, Coughing, Convulsions)'
    , water: 'Please describe the problem you are having with water. (Example: no clean water)'
    , food: 'Please describe the food problem your are seeing. (Example: there is not enough food)'
    , shelter: 'Please describe the shelter problems you are seeing. (Example: houses are unsafe to live in)'
    , violence: 'Please describe the violence issues you are seeing. (Example: looters are stealing from local businesses)'
    , otherProblem: 'Please describe the problem you are seeing in your own words.'
    , howMany: 'About how many people are affected by this problem? (Example: 42)'
    , canContact: 'May we contact you at this number if we need more information? (Text "%s" or "%s")'
    , comment: 'Is there anything else we should know? Also, if we did not recognize your location, please tell us precisely where you are.'
    , thanks: 'Thank you for this report. It will help the international aid response to understand how we can help.'
    */
};