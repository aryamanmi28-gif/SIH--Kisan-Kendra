# 🌾 Kisan Kendra — Smart Farmer Procurement & Slot Management System

A comprehensive, end-to-end digital platform designed for government crop procurement, mandi queue optimization, multi-language farmer support, and Direct Benefit Transfer (DBT) payment tracking. Built for Smart India Hackathon (SIH) Problem Statement 26032.

---

## 🏗️ System Architecture & Sub-Modules

The project is structured into 3 modular sub-systems:

```
SIH--Kisan-Kendra/
├── 📱 kisan-kendra/    # React + Vite + TailwindCSS Farmer & Officer Web Frontend
├── ⚙️ sih-backend/      # Django REST Framework Backend API (JWT Auth, Queue Engine)
└── 🤖 chat-bot/         # Kisan Sahayak 7-Language AI Assistant & Voice Guide
```

---

## 🌟 Key Features

### 1. 📱 Farmer & Officer Web Portal (`kisan-kendra`)
- **Slot Booking Engine**: Allows farmers to select procurement centres, choose available date/time slots, and book crop lots with capacity limits.
- **Live Mandi Queue Tracker**: Real-time token system with position tracking and estimated wait times.
- **Officer Queue Control Dashboard**: Digital check-in, token calling (`waiting` → `called` → `serving` → `served`), weighment recording, and skip management.
- **DBT Payment Tracker**: Real-time 4-stage tracking timeline for Direct Benefit Transfer payment credit status.

### 2. ⚙️ Django REST API Backend (`sih-backend`)
- **Dual JWT Authentication**: Separate authentication flows for Farmers (Phone Number) and Staff Officers (Staff credentials).
- **Per-Centre Token Logic**: Independent daily token sequence resetting per mandi centre per day.
- **Idempotent Operations**: Safe re-check-in and procurement recording to prevent duplicate queue entries.
- **Complete REST API Docs**: Documented in [`sih-backend/API.md`](file:///c:/Users/Admin/Desktop/SIH/sih-backend/API.md).

### 3. 🤖 Kisan Sahayak Multi-Language Chatbot (`chat-bot`)
- **7 Regional Languages**: Full support for English (`en`), Hindi (`hi`), Kannada (`kn`), Tamil (`ta`), Telugu (`te`), Marathi (`mr`), and Punjabi (`pa`).
- **5-Step Farmer Guided Journey**: Step-by-step assistance for Registration, Slot Booking, Gate Check-in, Digital Weighbridge, and Payment Tracking.
- **Text-to-Speech (Voice Output)**: Web Speech API integration for illiterate or visually challenged farmers.
- **Standalone Demo**: Includes `standalone_demo.html` for instant testing without server setup.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)

---

### 1. Running the Frontend (`kisan-kendra`)

```bash
cd kisan-kendra
npm install
npm run dev
```
The frontend will launch at `http://localhost:5173`.

---

### 2. Running the Backend API (`sih-backend`)

```bash
cd sih-backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
The REST API will start at `http://localhost:8000/api/`.

---

### 3. Testing the Chatbot Standalone (`chat-bot`)

Simply open `chat-bot/standalone_demo.html` in any modern web browser, or import the `<ChatbotWidget />` component into any React view:

```jsx
import { ChatbotWidget } from './chat-bot';

function App() {
  return <ChatbotWidget defaultLang="hi" />;
}
```

---

## 📖 Detailed Documentation

- **Backend API Reference**: See [`sih-backend/API.md`](file:///c:/Users/Admin/Desktop/SIH/sih-backend/API.md) for full endpoint specifications, request payloads, and response formats.
- **Chatbot Documentation**: See [`chat-bot/README.md`](file:///c:/Users/Admin/Desktop/SIH/chat-bot/README.md) for engine architecture and voice readout guides.

---

## 📞 Kisan Helpline Support
- **Toll-Free Helpline**: 1800-180-1551 (6:00 AM – 9:00 PM)
- **Official Email**: support@kisankendra.gov.in
