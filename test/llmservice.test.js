// test/llmservice.test.js
const chai = require('chai');
const nock = require('nock');
const { processPatientResponse } = require('../src/utils/llmservice');
const expect = chai.expect;

describe('LLM Service - processPatientResponse', function () {
     afterEach(() => {
          nock.cleanAll();
     });

     it('should return shouldProceed true if the LLM response includes "OK"', async function () {
          // Stub the OpenAI API response for confirmation
          nock('https://api.openai.com')
               .post('/v1/chat/completions')
               .reply(200, {
                    choices: [{
                         message: { content: 'OK' }
                    }]
               });

          const result = await processPatientResponse("I took my meds");
          // Only check that shouldProceed is true, regardless of extra fields
          expect(result.shouldProceed).to.be.true;
     });

     it('should return a follow-up prompt when response does not include "OK"', async function () {
          nock('https://api.openai.com')
               .post('/v1/chat/completions')
               .reply(200, {
                    choices: [{
                         message: { content: 'Please confirm, did you take Aspirin?' }
                    }]
               });

          const result = await processPatientResponse("I forgot my meds");
          expect(result.shouldProceed).to.be.false;
          expect(result.followUpPrompt).to.be.a('string');
     });

     it('should default to shouldProceed true if an error occurs', async function () {
          nock('https://api.openai.com')
               .post('/v1/chat/completions')
               .reply(401, { error: { message: "Unauthorized" } });

          const result = await processPatientResponse("Some response");
          expect(result.shouldProceed).to.be.true;
     });
});
