// src/controllers/callController.js
const twilioClient = require('../utils/twilioClient');
const db = require('../utils/db');
const twilio = require('twilio');

// Utility function to save call log data to the SQLite database
function saveCallLog({ callSid, phoneNumber, status, patientResponse, recordingUrl }) {
     const stmt = db.prepare(
          `INSERT INTO call_logs (callSid, phoneNumber, status, patientResponse, recordingUrl) 
     VALUES (?, ?, ?, ?, ?)`
     );
     stmt.run(callSid, phoneNumber, status, patientResponse, recordingUrl, (err) => {
          if (err) {
               console.error("Error saving call log:", err);
          } else {
               console.log("Call log saved for callSid:", callSid);
          }
     });
     stmt.finalize();
}

// POST /trigger-call
exports.triggerCall = async (req, res) => {
     const { phoneNumber } = req.body;
     if (!phoneNumber) {
          return res.status(400).json({ error: "phoneNumber is required" });
     }

     try {
          // Create an initial record with a dummy callSid
          const dummyCallSid = "pending";
          saveCallLog({
               callSid: dummyCallSid,
               phoneNumber,
               status: "initiated",
               patientResponse: "",
               recordingUrl: ""
          });

          const publicUrl = process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`;

          // Initiate the call via Twilio with recording enabled and a recording status callback
          const call = await twilioClient.calls.create({
               url: `${publicUrl}/voice-call?phone=${encodeURIComponent(phoneNumber)}`,
               to: phoneNumber,
               from: process.env.TWILIO_PHONE_NUMBER,
               record: true,  // Enable call recording
               recordingStatusCallback: `${publicUrl}/webhook/recording`,
               recordingStatusCallbackMethod: 'POST',
               statusCallback: `${publicUrl}/webhook/call-status`,
               statusCallbackMethod: 'POST',
               statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed']
          });

          // Update the log with the actual Call SID
          db.run(`UPDATE call_logs SET callSid = ? WHERE callSid = ?`, [call.sid, dummyCallSid], (err) => {
               if (err) console.error("Error updating callSid:", err);
          });

          res.json({ message: "Call initiated", callSid: call.sid });
     } catch (error) {
          console.error("Error triggering call:", error);
          res.status(500).json({ error: "Failed to trigger call" });
     }
};

// POST /voice-call
exports.voiceCall = (req, res) => {
     const VoiceResponse = twilio.twiml.VoiceResponse;
     const response = new VoiceResponse();

     // Use <Gather> to capture speech input from the patient
     const gather = response.gather({
          input: 'speech',
          action: '/webhook/voice-response',
          method: 'POST',
          timeout: 5
     });
     gather.say("Hello, this is a reminder from your healthcare provider to confirm your medications for the day. Please confirm if you have taken your Aspirin, Cardivol, and Metformin today.");

     // Fallback if no response is received
     response.say("We did not receive your response. Please call us back or take your medications if you haven't done so.");
     res.type('text/xml');
     res.send(response.toString());
};

// POST /webhook/voice-response
exports.voiceResponse = (req, res) => {
     const speechResult = req.body.SpeechResult || "No response captured";
     const callSid = req.body.CallSid || "unknown";
     const phoneNumber = req.query.phone || "unknown";

     console.log(`Received response for call ${callSid}: ${speechResult}`);

     // Update the call log with the patient's response and status "answered"
     db.run(
          `UPDATE call_logs SET patientResponse = ?, status = ? WHERE callSid = ?`,
          [speechResult, "answered", callSid],
          (err) => {
               if (err) {
                    console.error("Error updating call log with patient response:", err);
               }
          }
     );

     const VoiceResponse = twilio.twiml.VoiceResponse;
     const responseTwiml = new VoiceResponse();
     responseTwiml.say("Thank you. Your response has been recorded.");
     res.type('text/xml');
     res.send(responseTwiml.toString());
};

// POST /webhook/call-status
exports.callStatus = (req, res) => {
     const callSid = req.body.CallSid;
     const callStatus = req.body.CallStatus;
     console.log(`Call status update for ${callSid}: ${callStatus}`);

     // Update the call status in the database
     db.run(`UPDATE call_logs SET status = ? WHERE callSid = ?`, [callStatus, callSid], (err) => {
          if (err) {
               console.error("Error updating call log:", err);
          }
     });

     // If the call was not answered, send an SMS fallback
     if (callStatus === 'no-answer') {
          db.get(`SELECT phoneNumber FROM call_logs WHERE callSid = ?`, [callSid], (err, row) => {
               if (row && row.phoneNumber) {
                    const smsBody = "We called to check on your medication but couldn't reach you. Please call us back or take your medications if you haven't done so.";
                    twilioClient.messages.create({
                         body: smsBody,
                         from: process.env.TWILIO_PHONE_NUMBER,
                         to: row.phoneNumber
                    })
                         .then(message => console.log("SMS sent, SID:", message.sid))
                         .catch(error => console.error("Error sending SMS:", error));
               }
          });
     }
     res.sendStatus(200);
};

// NEW: POST /webhook/recording
exports.recordingWebhook = (req, res) => {
     const callSid = req.body.CallSid;
     const recordingUrl = req.body.RecordingUrl;
     console.log(`Recording completed for call ${callSid}: ${recordingUrl}`);

     // Update the call log with the recording URL
     db.run(`UPDATE call_logs SET recordingUrl = ? WHERE callSid = ?`, [recordingUrl, callSid], (err) => {
          if (err) {
               console.error("Error updating call log with recording URL:", err);
          } else {
               console.log(`Recording URL saved for call ${callSid}`);
          }
     });

     res.sendStatus(200);
};

// NEW: POST /inbound-call
// This function is for handling inbound calls. When someone calls your Twilio number directly,
// they will hear the same medication reminder message.
exports.inboundCall = (req, res) => {
     const VoiceResponse = twilio.twiml.VoiceResponse;
     const response = new VoiceResponse();

     // Use <Gather> to capture speech input (if desired) and deliver the reminder message
     const gather = response.gather({
          input: 'speech',
          action: '/webhook/voice-response',
          method: 'POST',
          timeout: 5
     });
     gather.say("Hello, this is a reminder from your healthcare provider to confirm your medications for the day. Please confirm if you have taken your Aspirin, Cardivol, and Metformin today.");

     // Fallback if no response is captured
     response.say("We did not receive your response. Please call us back or take your medications if you haven't done so.");
     res.type('text/xml');
     res.send(response.toString());
};

// GET /call-logs
exports.getCallLogs = (req, res) => {
     db.all(`SELECT * FROM call_logs ORDER BY timestamp DESC`, [], (err, rows) => {
          if (err) {
               res.status(500).json({ error: err.message });
          } else {
               res.json(rows);
          }
     });
};
