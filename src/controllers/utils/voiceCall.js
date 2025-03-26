const twilio = require('twilio');
module.exports = function voiceCall(req, res) {
     const VoiceResponse = twilio.twiml.VoiceResponse;
     const response = new VoiceResponse();

     // Twilio sets this once it finishes AMD
     const answeredBy = req.body.AnsweredBy;   // "human", "machine_end_beep", "unknown", etc.

     if (answeredBy === 'machine_end_beep') {
          // === It’s a machine (voicemail) ===
          // Deliver a simple, one-way message:
          // For now, this won't be sent as for a trial account, we have to press a key to bypass Twilio's trial message.
          // We can do that when we pick up the call, but a voiceMail machine can't do that.
          response.say("We called to check on your medication but couldn't reach you. Please call us back or take your medications if you haven't done so.");

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
          gather.say("Hello, this is a reminder from your healthcare provider to confirm your medications for the day. Please confirm if you have taken your Aspirin, Cardivol, and Metformin today.");

          response.say("We did not receive your response. Please call us back or take your medications if you haven't done so.");
     }

     res.type('text/xml');
     res.send(response.toString());
};
