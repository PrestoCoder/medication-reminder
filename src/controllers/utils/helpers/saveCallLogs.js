const db = require('../../../utils/db');
exports.saveCallLog = function ({ callSid, phoneNumber, status, patientResponse, recordingUrl, voiceMessageDelivered = 0, smsDelivered = 0 }) {
     const stmt = db.prepare(`INSERT INTO call_logs (callSid, phoneNumber, status, patientResponse, recordingUrl, voiceMessageDelivered, smsDelivered) VALUES (?, ?, ?, ?, ?, ?, ?)`);
     stmt.run(callSid, phoneNumber, status, patientResponse, recordingUrl, voiceMessageDelivered, smsDelivered, (err) => {
          if (err) console.error("Error saving call log:", err);
          else console.log("Call log saved for callSid:", callSid);
     });
     stmt.finalize();
};