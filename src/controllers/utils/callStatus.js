const db = require('../../utils/db');
const sendVoiceMessage = require('./helpers/sendVoiceMessage');
module.exports = function callStatus(req, res) {
     const callSid = req.body.CallSid;
     const callStatus = req.body.CallStatus;
     db.run(`UPDATE call_logs SET status = ? WHERE callSid = ?`, [callStatus, callSid]);
     if (["busy", "no-answer", "canceled"].includes(callStatus)) {
          db.get(`SELECT phoneNumber FROM call_logs WHERE callSid = ?`, [callSid], (err, row) => {
               if (row && row.phoneNumber) {
                    sendVoiceMessage(row.phoneNumber)
                         .then(() => db.run(`UPDATE call_logs SET voiceMessageDelivered = 1 WHERE callSid = ?`, [callSid]))
                         .catch(err => console.error("Error sending voice message:", err));
               }
          });
     }
     res.sendStatus(200);
};