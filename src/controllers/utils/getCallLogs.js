const db = require('../../utils/db');
module.exports = function getCallLogs(req, res) {
     db.all(`SELECT * FROM call_logs ORDER BY timestamp DESC`, [], (err, rows) => {
          if (err) res.status(500).json({ error: err.message });
          else res.json(rows);
     });
};