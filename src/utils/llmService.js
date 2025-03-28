const axios = require('axios');

/**
 * Generates a follow-up response for a patient's answer.
 */
async function getFollowUpResponse(patientText) {
     try {
          const response = await axios.post(
               'https://api.openai.com/v1/engines/text-davinci-003/completions',
               {
                    prompt: `Patient said: "${patientText}". Provide a helpful follow-up response that clarifies if the medication was taken, or asks for further confirmation if needed.`,
                    max_tokens: 50,
                    temperature: 0.7,
               },
               {
                    headers: {
                         'Authorization': `Bearer ${process.env.LLM_API_KEY}`,
                         'Content-Type': 'application/json'
                    }
               }
          );
          return response.data.choices[0].text.trim();
     } catch (err) {
          console.error("LLM error:", err);
          return "We're having trouble processing your response.";
     }
}

/**
 * Checks whether the patient's response indicates a clear confirmation.
 * If so, returns an object with shouldProceed: true.
 * Otherwise, returns shouldProceed: false along with a follow-up prompt.
 */
async function processPatientResponse(patientText) {
     try {
          const response = await axios.post(
               'https://api.openai.com/v1/engines/text-davinci-003/completions',
               {
                    prompt: `Patient said: "${patientText}". If this clearly indicates that the patient has taken their medication, reply with just "OK". Otherwise, provide a brief follow-up question to clarify the response.`,
                    max_tokens: 50,
                    temperature: 0.3,
               },
               {
                    headers: {
                         'Authorization': `Bearer ${process.env.LLM_API_KEY}`,
                         'Content-Type': 'application/json'
                    }
               }
          );
          const resultText = response.data.choices[0].text.trim();
          if (resultText.toLowerCase().includes("ok")) {
               return { shouldProceed: true };
          } else {
               return { shouldProceed: false, followUpPrompt: resultText };
          }
     } catch (err) {
          console.error("LLM error:", err);
          return { shouldProceed: true }; // default to proceeding in case of an error
     }
}

module.exports = { getFollowUpResponse, processPatientResponse };
