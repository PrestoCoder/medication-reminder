const twilio = require('twilio');
module.exports = function voiceMessage(req, res) {
     const VoiceResponse = twilio.twiml.VoiceResponse;
     const response = new VoiceResponse();
     response.say("We called to check on your medication but couldn't reach you. Please call us back or take your medications if you haven't done so.");
     res.type('text/xml');
     res.send(response.toString());
};