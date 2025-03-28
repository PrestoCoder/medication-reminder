// src/controllers/utils/inboundCall.js
const twilio = require('twilio');
const db = require('../../utils/db');
const twilioClient = require('../../utils/twilioClient');

module.exports = async function inboundCall(req, res) {
     const VoiceResponse = twilio.twiml.VoiceResponse;
     const callSid = req.body.CallSid;
     const fromNumber = req.body.From;
     const publicUrl = process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`;

     // 1) Insert a basic call log into the DB
     db.run(
          `INSERT INTO call_logs (callSid, phoneNumber, status) VALUES (?, ?, ?)`,
          [callSid, fromNumber, 'inbound'],
          (err) => {
               if (err) console.error("DB insert error:", err);
               else console.log(`Call log inserted for ${callSid}`);
          }
     );

     // 2) Start recording the inbound call with more robust recording options
     try {
          const recording = await twilioClient.calls(callSid).recordings.create({
               recordingChannels: 'dual', // Record caller and agent on separate channels
               recordingTrack: 'both-sides', // Record both incoming and outgoing audio
               recordingStatusCallback: `${publicUrl}/webhook/recording`,
               statusCallbackEvent: ['completed', 'failed'] // Track recording events
          });
          console.log(`Recording started for call ${callSid}:`, recording.sid);
     } catch (err) {
          console.error(`Error starting recording for call ${callSid}:`, err.message);
     }

     // 3) Generate TwiML 
     const response = new VoiceResponse();

     // Speech gathering logic FIRST
     const gather = response.gather({
          input: 'speech',
          action: `${publicUrl}/webhook/inbound-voice-response`,
          method: 'POST',
          timeout: 5,  // Increased timeout to give more time
          language: 'en-US',
          hints: 'yes,no'
     });

     gather.say(
          "Hello, this is a reminder from your healthcare provider to confirm your medications for the day. " +
          "Please say YES if you have taken your Aspirin, Cardivol, and Metformin, or NO if you haven't."
     );

     // 4) Fallback message if no response is received
     response.say("We did not receive your response. Goodbye.");
     response.hangup();

     // 5) Send the TwiML back to Twilio
     res.type('text/xml');
     res.send(response.toString());
};