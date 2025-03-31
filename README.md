Here’s the complete updated `README.md` with the new **Usage** section and instructions on how to pass a phone number to the test suite:

---

```markdown
# Medication Reminder System

A voice-driven medication reminder system built using Node.js, Twilio, and an LLM-backed voice interface. This service enables real-time medication reminders and logging via voice calls with intelligent handling of voicemails, speech recognition, and automated interactions.

---

## 📦 Features

### ✅ Outgoing Calls

1. **Automated Message Playback**  
   System initiates calls using TTS to remind patients about their medications.

2. **Speech-to-Text Capture**  
   The patient's spoken reply is converted to text and stored in the database.

3. **Call Recording URL**  
   Each call's recording URL is stored and displayed for review.

4. **Voicemail Handling**  
   If the call is declined or unanswered, a voice message is left using AMD (Answering Machine Detection) to ensure it's played after the beep.

5. **SMS Fallback**  
   Intended to send SMS if voicemail is unavailable, but due to Twilio number restrictions, SMS authorization failed during testing (denied twice).

6. **Answering Machine Detection (AMD)**  
   Introduces a ~5s delay but ensures voicemail is clear and not overlapping with the voice message.

7. **LLM Integration**  
   Patients can converse with the system in real-time via phone, with the system continuing the conversation until the patient confirms whether they've taken their medicine.

---

### 📞 Incoming Calls

- Same as outgoing call flow, **except**:
  - No voicemail handling.
  - AMD is **still required**, since only humans are expected to call back.

---

## ⚠️ Special Considerations

- **AMD Delay**: A 5-second delay is introduced, but it's essential. Without it, voicemail overlaps the system message in the final recording.
- **Carrier Voicemail Fallback**: Even if voicemail is disabled on the mobile device, calls may be routed to the carrier’s voicemail when declined. AMD helps handle this reliably.

---

## 🚀 Usage

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/medication-reminder.git
cd medication-reminder
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Create a `.env` File

In the root directory, create a `.env` file with the following:

```env
TWILIO_ACCOUNT_SID=your_twilio_sid             # From your Twilio console
TWILIO_AUTH_TOKEN=your_twilio_auth_token       # From your Twilio console
TWILIO_PHONE_NUMBER=your_twilio_phone_number   # Must be a verified or authorized number
LLM_API_KEY=your_llm_service_key               # Your chosen LLM service API key
PORT=3000                                      # Or any preferred port
DATABASE_FILE=call_logs.db                     # SQLite file path for storing call logs
PUBLIC_URL=https://your-ngrok-url              # Public URL from ngrok for webhook callback
```

- All tokens and IDs must be your own.
- Use [`ngrok`](https://ngrok.com/) to expose your local server and obtain the `PUBLIC_URL`.

### Step 4: Start the Server
```bash
npm start
```

---

## 📲 API Usage

### Trigger a Call
```http
POST /call
Content-Type: application/json

{
  "phoneNumber": "+1234567890"
}
```

---

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Pass a Phone Number to the Test

There are two ways to provide a custom phone number:

#### 1. Using Environment Variable
```bash
TEST_PHONE_NUMBER=+1623XXXXXXX npm test
```

Ensure your test file reads it like:

```js
const phoneNumber = process.env.TEST_PHONE_NUMBER || '+10000000000';
```

#### 2. Using Command-Line Argument
```bash
npm test -- --phone=+1623XXXXXXX
```

In your test file:
```js
const phoneNumberArg = process.argv.find(arg => arg.startsWith('--phone='));
const phoneNumber = phoneNumberArg ? phoneNumberArg.split('=')[1] : '+10000000000';
```

---

## 🛠 Tech Stack

- **Node.js** (Express)
- **Twilio Voice API**
- **STT/TTS Services** (e.g., Deepgram, ElevenLabs)
- **LLM API** for natural phone conversation
- **SQLite** (`call_logs.db`) for storing call logs

---

## 📈 Bonus Features Implemented

- ✅ LLM-based live phone interaction
- ✅ Database storage of call logs
- ✅ Call recording URL capture
- ✅ Voice message handling via AMD
- ⚠️ SMS sending attempted but blocked due to Twilio restrictions

---

## 📧 Contact

For questions or issues, contact: `your-email@example.com`
```

---

Let me know your GitHub repo link if you'd like me to personalize this further.
