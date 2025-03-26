// src/controllers/utils/inboundVoiceResponse.js
const twilio = require('twilio');
const db = require('../../utils/db');

module.exports = function inboundVoiceResponse(req, res) {
     const VoiceResponse = twilio.twiml.VoiceResponse;
     const response = new VoiceResponse();

     const callSid = req.body.CallSid;
     const speechResult = req.body.SpeechResult || '';

     console.log('Inbound call SpeechResult:', speechResult);

     // Update DB with the recognized text
     db.run(
          `UPDATE call_logs
       SET patientResponse = ?
     WHERE callSid = ?`,
          [speechResult, callSid],
          (err) => {
               if (err) console.error("Error updating patientResponse:", err);
          }
     );

     // Respond with TwiML
     response.say(`You said: ${speechResult}. Thank you! Goodbye.`);
     response.hangup();

     res.type('text/xml');
     res.send(response.toString());
};
