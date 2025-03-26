// src/controllers/utils/voiceResponse.js
const twilio = require('twilio');
const db = require('../../utils/db');

module.exports = function voiceResponse(req, res) {
     const VoiceResponse = twilio.twiml.VoiceResponse;
     const response = new VoiceResponse();

     const callSid = req.body.CallSid;
     const speechResult = req.body.SpeechResult || '';

     // Update DB with the speech (optional)
     db.run(
          `UPDATE call_logs SET patientResponse = ? WHERE callSid = ?`,
          [speechResult, callSid],
          (err) => {
               if (err) console.error("DB update failed:", err);
          }
     );

     // Reply with "You said ..." + confirmation
     response.say(`You said: ${speechResult}. Thank you for confirming your medication status.`);
     response.hangup();

     res.type('text/xml');
     res.send(response.toString());
};
