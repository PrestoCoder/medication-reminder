// tests/integration.test.js
const request = require('supertest');
const app = require('../src/app');

describe("GET /call-logs", () => {
     it("should return an array of call logs", async () => {
          const res = await request(app).get("/call-logs");
          expect(res.statusCode).toEqual(200);
          expect(Array.isArray(res.body)).toBe(true);
     });
});
