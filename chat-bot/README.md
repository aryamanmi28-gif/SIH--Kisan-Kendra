# Kisan Sahayak Multi-Language Chatbot Module

An intelligent, multi-language AI assistant and process guide designed for the **Kisan Kendra** crop procurement platform. It empowers farmers with 24/7 access to procurement information, slot booking rules, perishable crop priority windows, live mandi queue tracking, government MSP rates, and direct bank transfer (DBT) payment status in 7 regional languages.

---

## 🌟 Key Features

1. **Multi-Language Access (7 Languages):**
   - English (`en`)
   - Hindi (`hi` - हिन्दी)
   - Kannada (`kn` - ಕನ್ನಡ)
   - Tamil (`ta` - தமிழ்)
   - Telugu (`te` - తెలుగు)
   - Marathi (`mr` - मराठी)
   - Punjabi (`pa` - ਪੰਜਾਬੀ)

2. **Farmer Journey Guided Process Assistant (⚡ Process Guide):**
   - Step-by-step guidance for every stage of procurement:
     - **Step 1:** Registration & Documents (Aadhaar, Land Khasra/Khatauni, Mobile OTP).
     - **Step 2:** Slot Booking (Centres selection, morning priority slots).
     - **Step 3:** Mandi Gate Check-in (Token QR code scan).
     - **Step 4:** Live Queue Tracking & Digital Weighbridge (Moisture testing, Grade A vs Standard, MSP receipt).
     - **Step 5:** DBT Direct Payment Tracking (4-stage progress timeline & UTR reference number).
   - Direct action buttons inside chat responses to jump straight to the relevant screen (e.g. `/centres`, `/queue`, `/procurement`, `/register`).

3. **Full Project Knowledge Base & Intent Matching:**
   - Multi-lingual token & keyword scoring algorithm.
   - Comprehensive answers on slot constraints (1 active booking per lot/day/farmer), perishable Paddy early morning priority window (6 AM - 10 AM), gate check-in rules, weighment procedures, and official Government MSP rates for Paddy, Wheat, Maize, Cotton, Soybean, Gram, Mustard, and Tur.
   - Emergency contacts & toll-free helpline number (`1800-180-1551`).

4. **Multi-Language Voice Readout (Text-to-Speech):**
   - Web Speech API integration that speaks out chatbot answers in Indian English, Hindi, Kannada, Tamil, Telugu, Marathi, or Punjabi accents for illiterate or visually challenged farmers.

5. **Standalone HTML Visual Demo:**
   - Pre-packaged runnable HTML file (`standalone_demo.html`) to test the chatbot in any browser without requiring build tools or backend dependencies.

---

## 📁 Directory Structure

```
chat-bot/
├── knowledge_base.js   # Multi-language translations, FAQ database & 5-step process guides
├── bot_engine.js       # Natural language matching, scoring engine & process step resolvers
├── ChatbotWidget.jsx   # Premium React UI widget component with glassmorphism & voice toggle
├── index.js            # ES module exports for clean integration
├── standalone_demo.html# Self-contained visual test suite and runnable demo page
└── README.md           # Full documentation and usage guide
```

---

## 🚀 How to Integrate into React Applications

### 1. Simple Import & Mounting
```jsx
import { ChatbotWidget } from './chat-bot'

function App() {
  return (
    <div>
      {/* Rest of your application routes */}
      <ChatbotWidget defaultLang="en" />
    </div>
  )
}
```

### 2. Using Programmatic Engine Methods
```javascript
import { getBotResponse, getFaqsForLang, getProcessGuideStep } from './chat-bot'

// Fetch answer for a farmer query in Hindi
const response = getBotResponse("स्लॉट कैसे बुक करें", "hi")
console.log(response.text)

// Get Step 1 process guide in Kannada
const step1 = getProcessGuideStep("step1", "kn")
console.log(step1.title, step1.details)
```

---

## 🌐 Running Standalone Demo

To view and test the chatbot visually:
Double-click `chat-bot/standalone_demo.html` or open it directly in any web browser.

---

## 📞 Toll-Free Kisan Helpline
- **Phone:** 1800-180-1551 (6:00 AM – 9:00 PM)
- **Email:** support@kisankendra.gov.in
