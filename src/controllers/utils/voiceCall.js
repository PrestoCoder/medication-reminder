const twilio = require('twilio');
module.exports = function voiceCall(req, res) {
     const VoiceResponse = twilio.twiml.VoiceResponse;
     const response = new VoiceResponse();

     // Twilio sets this once it finishes AMD
     const answeredBy = req.body.AnsweredBy;   // "human", "machine_end_beep", "unknown", etc.

     if (answeredBy && answeredBy.includes('machine')) {
          // === It’s a machine (voicemail) ===
          // Deliver a simple, one-way message:
          response.say("Hello! This is your healthcare provider with an important reminder. Please check your messages for details.");

          // Optionally, end the call after leaving the message:
          response.hangup();
     } else {
          // === It’s a human (or unknown) ===
          // Do interactive stuff, e.g. gather speech:
          const gather = response.gather({
               input: 'speech',
               action: '/webhook/voice-response',
               method: 'POST',
               timeout: 5
          });
          gather.say("Hello, this is a reminder from your healthcare provider to confirm your medications. Please say Yes or No.");

          response.say("We did not receive your response. Please call us back or take your medications if you haven't done so.");
     }

     res.type('text/xml');
     res.send(response.toString());
};
