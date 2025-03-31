// src/controllers/utils/inboundVoiceResponse.js
const twilio = require('twilio');
const db = require('../../utils/db');
const { processPatientResponse } = require('../../utils/llmservice');

module.exports = async function inboundVoiceResponse(req, res) {
     const VoiceResponse = twilio.twiml.VoiceResponse;
     const twimlResponse = new VoiceResponse();

     const callSid = req.body.CallSid;
     const speechResult = req.body.SpeechResult || '';

     console.log('Inbound call SpeechResult:', speechResult);

     // Update DB with the patient's response
     db.run(
          `UPDATE call_logs SET patientResponse = ? WHERE callSid = ?`,
          [speechResult, callSid],
          (err) => {
               if (err) console.error("Error updating patientResponse:", err);
          }
     );

     try {
          // Process the patient's response via the LLM
          const llmResult = await processPatientResponse(speechResult);
          console.log('LLM result:', llmResult);

          if (llmResult.shouldProceed) {
               // If the LLM indicates it's OK, confirm and end the call.
               twimlResponse.say(`You said: ${speechResult}. Thank you for confirming your medication status. Goodbye.`);
               twimlResponse.hangup();
          } else {
               // Otherwise, ask the follow-up prompt from the LLM.
               const followUpPrompt = llmResult.followUpPrompt || "Could you please clarify your response?";
               const gather = twimlResponse.gather({
                    input: 'speech',
                    action: '/webhook/inbound-voice-response',  // Reuse the same endpoint for further input
                    method: 'POST',
                    timeout: 10,
                    language: 'en-US'
               });
               gather.say(followUpPrompt);
               // Fallback if no response is given
               twimlResponse.say("We did not receive your response. Goodbye.");
               twimlResponse.hangup();
          }
     } catch (err) {
          console.error("LLM processing error:", err);
          // On error, default to a simple confirmation message
          twimlResponse.say(`You said: ${speechResult}. Thank you for confirming your medication status. Goodbye.`);
          twimlResponse.hangup();
     }

     res.type('text/xml');
     res.send(twimlResponse.toString());
};
