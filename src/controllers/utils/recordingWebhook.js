const db = require('../../utils/db');
module.exports = function recordingWebhook(req, res) {
     const callSid = req.body.CallSid;
     const recordingUrl = req.body.RecordingUrl;
     db.run(`UPDATE call_logs SET recordingUrl = ? WHERE callSid = ?`, [recordingUrl, callSid]);
     res.sendStatus(200);
};