// src/utils/llmservice.js
const axios = require('axios');

/**
 * processPatientResponse
 * 
 * Sends patient input to the OpenAI Chat Completion API using gpt-3.5-turbo.
 * If the LLM response includes "OK" (case-insensitive), it indicates
 * the patient has confirmed medication usage. Otherwise, returns a follow-up
 * prompt for further clarification.
 */
async function processPatientResponse(patientText) {
     try {
          const response = await axios.post(
               'https://api.openai.com/v1/chat/completions',
               {
                    model: 'gpt-3.5-turbo',
                    messages: [
                         {
                              role: 'system',
                              content: 'You are a helpful medical assistant verifying medication usage. You have asked the patient to confirm if they have taken your Aspirin, Cardivol, and Metformin today.'
                         },
                         {
                              role: 'user',
                              content: `Patient said: "${patientText}". 
                              If this clearly indicates that the patient has taken their medication, reply with just "OK". 
                              Otherwise, ask a brief follow-up question, or answer the patient's question.`
                         }
                    ],
                    max_tokens: 50,
                    temperature: 0.3
               },
               {
                    headers: {
                         Authorization: `Bearer ${process.env.LLM_API_KEY}`, // set your OpenAI API key in .env
                         'Content-Type': 'application/json'
                    }
               }
          );

          // Extract the reply from the assistant message
          const resultText = response.data.choices[0].message.content.trim();

          // If LLM's answer includes "OK", assume patient has confirmed meds
          if (resultText.toLowerCase().includes('ok')) {
               return { shouldProceed: true, concludingResponse: resultText };
          } else {
               // Otherwise, return the follow-up prompt
               return { shouldProceed: false, followUpPrompt: resultText };
          }
     } catch (err) {
          console.error('LLM error:', err);
          // If an error occurs, default to "shouldProceed = true"
          return { shouldProceed: true };
     }
}

module.exports = { processPatientResponse };
