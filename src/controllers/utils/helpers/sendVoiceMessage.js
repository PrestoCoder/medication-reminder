const twilioClient = require('../../../utils/twilioClient');
exports.sendVoiceMessage = function (phoneNumber) {
     const publicUrl = process.env.PUBLIC_URL || 'http://localhost:3000';
     return twilioClient.calls.create({
          url: `${publicUrl}/voice-message`,
          to: phoneNumber,
          from: process.env.TWILIO_PHONE_NUMBER,
          method: 'POST'
     });
};