// test/api.test.js
const request = require('supertest');
const app = require('../src/app'); // ensure your app.js exports the Express app
const chai = require('chai');
const expect = chai.expect;
const nock = require('nock');

describe('API Endpoints', () => {

     const phoneNumber = process.env.TEST_PHONE_NUMBER || '+10000000000'; // fallback
     // Example: Test the /trigger-call endpoint
     it('should trigger a call and return a callSid', async () => {
          // Since triggering an actual call would hit Twilio,
          // you might want to stub the Twilio client methods.
          // For simplicity here, assume the endpoint returns a JSON with callSid.
          const res = await request(app)
               .post('/trigger-call')
               .send({ phoneNumber })
               .expect(200);

          expect(res.body).to.have.property('callSid');
     });

     // Example: Test the /voice-response endpoint (outgoing)
     it('should handle voice response and return valid TwiML', async () => {
          // Stub the LLM service by intercepting the OpenAI call
          nock('https://api.openai.com')
               .post('/v1/chat/completions')
               .reply(200, {
                    choices: [{
                         message: { content: 'OK' }
                    }]
               });

          const res = await request(app)
               .post('/webhook/voice-response')
               .send({ CallSid: 'CA_TEST', SpeechResult: 'Yes, I took my meds' })
               .expect('Content-Type', /xml/)
               .expect(200);

          // Assert that the TwiML includes a confirmation message
          expect(res.text).to.contain('Thank you for confirming your medication status');
     });

     // Example: Test the /inbound-voice-response endpoint (inbound)
     it('should handle inbound voice response and ask follow-up if needed', async () => {
          // Here we simulate a non-confirmatory response via LLM
          nock('https://api.openai.com')
               .post('/v1/chat/completions')
               .reply(200, {
                    choices: [{
                         message: { content: 'Please repeat the medicines clearly.' }
                    }]
               });

          const res = await request(app)
               .post('/webhook/inbound-voice-response')
               .send({ CallSid: 'CA_INBOUND', SpeechResult: 'Could you please repeat the medicines?' })
               .expect('Content-Type', /xml/)
               .expect(200);

          // Check that the returned TwiML includes the follow-up prompt
          expect(res.text).to.contain('Please repeat the medicines clearly.');
     });
});
