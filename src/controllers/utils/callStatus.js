const db = require('../../utils/db');
const sendVoiceMessage = require('./helpers/sendVoiceMessage');
module.exports = function callStatus(req, res) {
     const callSid = req.body.CallSid;
     const callStatus = req.body.CallStatus;
     const answeredBy = req.body.AnsweredBy; // 'human', 'machine_end_beep', etc.

     // Save or update in DB
     db.run(`
       UPDATE call_logs
       SET status = ?, answeredBy = ?
       WHERE callSid = ?
     `, [callStatus, answeredBy, callSid]);

     res.sendStatus(200);
};
