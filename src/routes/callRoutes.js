// src/routes/callRoutes.js
const express = require('express');
const router = express.Router();
const callController = require('../controllers/callController');

// Trigger a voice call
router.post('/trigger-call', callController.triggerCall);

// Endpoint that returns TwiML for outgoing calls
router.post('/voice-call', callController.voiceCall);

// Webhook to capture patient's speech response
router.post('/webhook/voice-response', callController.voiceResponse);

// Webhook to update call status and handle no-answer cases
router.post('/webhook/call-status', callController.callStatus);

// Recording webhook route
router.post('/webhook/recording', callController.recordingWebhook);

router.post('/inbound-call', callController.inboundCall);

// Endpoint to list all call logs
router.get('/call-logs', callController.getCallLogs);

// Voice message endpoint
router.post('/voice-message', callController.voiceMessage);

router.post('/webhook/inbound-voice-response', callController.inboundVoiceResponse);


module.exports = router;
