// src/utils/llmService.js
const axios = require('axios');

async function getLLMResponse(patientText) {
     try {
          const response = await axios.post(
               'https://api.openai.com/v1/engines/text-davinci-003/completions',
               {
                    prompt: `Patient said: "${patientText}". Provide a helpful follow-up response.`,
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

module.exports = { getLLMResponse };
