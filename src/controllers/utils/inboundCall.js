// src/controllers/utils/inboundCall.js
const twilio = require('twilio');
const db = require('../../utils/db');
const twilioClient = require('../../utils/twilioClient'); // make sure this is configured with your accountSid and authToken

module.exports = async function inboundCall(req, res) {
     const VoiceResponse = twilio.twiml.VoiceResponse;
     const response = new VoiceResponse();

     const callSid = req.body.CallSid;
     const fromNumber = req.body.From;

     // 1) Insert a basic call log into the DB
     db.run(
          `INSERT INTO call_logs (callSid, phoneNumber, status) VALUES (?, ?, ?)`,
          [callSid, fromNumber, 'inbound'],
          (err) => {
               if (err) console.error("DB insert error:", err);
          }
     );

     // 2) Generate TwiML with <Gather> to collect speech for up to 15 seconds
     const gather = response.gather({
          input: 'speech',
          action: '/webhook/inbound-voice-response',  // This will handle the SpeechResult
          method: 'POST',
          timeout: 5
     });

     gather.say(
          "Hello, this is a reminder from your healthcare provider to confirm your medications for the day. " +
          "Please say YES if you have taken your Aspirin, Cardivol, and Metformin, or NO if you haven't."
     );

     // Fallback message if no response
     response.say("We did not receive your response. Goodbye.");
     response.hangup();

     // 3) Send the TwiML back to Twilio
     res.type('text/xml');
     res.send(response.toString());

     // 4) Start recording the inbound call programmatically
     try {
          await twilioClient.calls(callSid).update({ record: true });
          console.log(`Recording started for call ${callSid}`);
     } catch (err) {
          console.error(`Error starting recording for call ${callSid}:`, err.message);
     }
};
