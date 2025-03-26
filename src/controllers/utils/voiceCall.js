const twilio = require('twilio');
module.exports = function voiceCall(req, res) {
     const VoiceResponse = twilio.twiml.VoiceResponse;
     const response = new VoiceResponse();
     const gather = response.gather({ input: 'speech', action: '/webhook/voice-response', method: 'POST', timeout: 5 });
     gather.say("Hello, this is a reminder from your healthcare provider to confirm your medications for the day. Please confirm if you have taken your Aspirin, Cardivol, and Metformin today.");
     response.say("We did not receive your response. Please call us back or take your medications if you haven't done so.");
     res.type('text/xml');
     res.send(response.toString());
};