const db = require('../../utils/db');
const twilio = require('twilio');
module.exports = function voiceResponse(req, res) {
     const speechResult = req.body.SpeechResult || "No response captured";
     const callSid = req.body.CallSid || "unknown";
     const phoneNumber = req.query.phone || "unknown";
     db.run(`UPDATE call_logs SET patientResponse = ?, status = ?, voiceMessageDelivered = ? WHERE callSid = ?`, [speechResult, "answered", 1, callSid]);
     const VoiceResponse = twilio.twiml.VoiceResponse;
     const responseTwiml = new VoiceResponse();
     responseTwiml.say("Thank you. Your response has been recorded.");
     res.type('text/xml');
     res.send(responseTwiml.toString());
};