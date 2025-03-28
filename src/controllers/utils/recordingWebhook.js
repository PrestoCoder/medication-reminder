// src/controllers/utils/recordingWebhook.js
const db = require('../../utils/db');

module.exports = function recordingWebhook(req, res) {
     console.log("Recording webhook received. Body:", req.body);

     const callSid = req.body.CallSid;
     const recordingUrl = req.body.RecordingUrl;

     if (!callSid || !recordingUrl) {
          console.error("Missing CallSid or RecordingUrl in webhook payload.");
          return res.sendStatus(400);
     }

     db.run(
          `UPDATE call_logs SET recordingUrl = ? WHERE callSid = ?`,
          [recordingUrl, callSid],
          function (err) {
               if (err) {
                    console.error("Error updating recordingUrl in DB:", err);
               } else {
                    console.log(`Recording URL updated for call ${callSid}`);
               }
          }
     );

     res.sendStatus(200);
};
