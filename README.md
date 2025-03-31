
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
   If the call is declined or unanswered, a voice message is left.  
   **Note**: AMD (Answering Machine Detection) is used only to wait for the machine's beep — it does not leave the message. It ensures the voice message is delivered clearly, after the beep.

5. **SMS Fallback**  
   Intended to send SMS if voicemail is unavailable, but due to Twilio number restrictions, SMS authorization failed during testing (denied twice).

6. **LLM Integration**  
   Patients can converse with the system in real-time via phone, with the system continuing the conversation until the patient confirms whether they've taken their medicine.

---

### 📞 Incoming Calls

- Same call flow as outgoing, **except**:
  - No voicemail is left.
  - **AMD is not used**, since only humans are expected to call back.
  - To reduce spam or irrelevant inbound calls, you can later maintain an allowlist in a DB to restrict caller numbers.

---

## ⚠️ Special Considerations

- **AMD Delay**: A 5-second delay is introduced, but it's essential. Without it, voicemail overlaps the system message in the final recording.
- **Carrier Voicemail Fallback**: Even if voicemail is disabled on the mobile device, calls may be routed to the carrier’s voicemail when declined. AMD ensures the message waits for the beep.
- **Answer Source Tracking**: In the database, an `answered_by` column is stored to indicate how the call was handled:
  - `"machine_end_beep"` → voicemail bot
  - `"human"` → a real person
  - `"unknown"` → user spoke but system couldn’t confirm
  - `NULL` → call was not picked up or no response was given

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
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
LLM_API_KEY=your_llm_service_key
PORT=3000
DATABASE_FILE=call_logs.db
PUBLIC_URL=https://your-ngrok-url
TEST_PHONE_NUMBER=+1623XXXXXXX
```

- All tokens and IDs must be your own.
- Use [`ngrok`](https://ngrok.com/) to expose your local server and obtain the `PUBLIC_URL`.

### Step 4: Start the Server

```bash
npm start
```

---

## 📲 API Usage

### 🔹 Make an Outbound Call

You can trigger an outbound call directly from the terminal:

```bash
curl -X POST http://localhost:3000/trigger-call \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+16237595186"}'
```

### 🔹 Receive an Inbound Call

- Keep the server running and make a call to your Twilio number.
- To allow inbound calls, **set your `PUBLIC_URL/inbound-call` as the webhook URL for voice calls in your Twilio Console**.

---

## 🧪 Testing

### How to Run

Make sure you've added `TEST_PHONE_NUMBER` in your `.env` file. Then simply run:

```bash
npm test
```

### What the Tests Cover

The test suite verifies key functionality of the system including:

- ✅ API route `/trigger-call` is working and accepts valid phone numbers
- ✅ Call initiation response structure is as expected
- ✅ System behaves correctly when a call is triggered to a live number (mock/stub mode can be added for isolated testing)
- ✅ Configuration variables (`.env`) are read properly
- ✅ Error scenarios are logged and handled gracefully

Tests are structured using standard Node.js test frameworks and simulate interaction with the core service logic without needing real API calls unless configured to.

---

## 🛠 Tech Stack

- **Node.js** (Express)
- **Twilio Voice API**
- **TwiML** for both TTS and STT (used instead of Deepgram/ElevenLabs to reduce latency)
- **LLM API** for phone-based natural language conversation
- **SQLite** (`call_logs.db`) for storing call logs with metadata like `answered_by`, response text, and call status

---

## 📈 Bonus Features Implemented

- ✅ LLM-based live phone interaction
- ✅ Database storage of call logs
- ✅ Call recording URL capture
- ✅ Voice message handling with AMD timing
- ✅ Differentiation of machine vs. human answer using `answered_by`
- ⚠️ SMS sending attempted but blocked due to Twilio restrictions

---

## 🔮 Future Enhancements

- Add a **patient-specific database**, with:
  - Patient name
  - Phone number
  - Prescribed medications
  - Call interaction records
- Extend the API to support patient-specific operations:
  - Trigger calls based on patient ID
  - Query historical medication confirmations per patient
  - Log missed confirmations and escalations
- Optionally add reminder scheduling and preferred call windows

---

## 📧 Contact

For questions or issues, contact: `rchhibba@asu.edu`
