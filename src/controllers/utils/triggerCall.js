const twilioClient = require('../../utils/twilioClient');
const db = require('../../utils/db');
const { saveCallLog } = require('./helpers/saveCallLogs');

module.exports = async function triggerCall(req, res) {
     const { phoneNumber } = req.body;
     if (!phoneNumber) return res.status(400).json({ error: "phoneNumber is required" });

     try {
          const dummyCallSid = "pending";
          saveCallLog({ callSid: dummyCallSid, phoneNumber, status: "initiated", patientResponse: "", recordingUrl: "", voiceMessageDelivered: 0, smsDelivered: 0 });
          const publicUrl = process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`;

          const call = await twilioClient.calls.create({
               url: `${publicUrl}/voice-call`,
               to: phoneNumber,
               from: process.env.TWILIO_PHONE_NUMBER,
               record: true,
               recordingStatusCallback: `${publicUrl}/webhook/recording`,
               recordingStatusCallbackMethod: 'POST',
               statusCallback: `${publicUrl}/webhook/call-status`,
               statusCallbackMethod: 'POST',
          });

          db.run(`UPDATE call_logs SET callSid = ? WHERE callSid = ?`, [call.sid, dummyCallSid]);
          res.json({ message: "Call initiated", callSid: call.sid });
     } catch (error) {
          console.error("Error triggering call:", error);
          res.status(500).json({ error: "Failed to trigger call" });
     }
};