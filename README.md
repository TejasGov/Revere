**🧠 Wearable Assistive AI System for Alzheimer’s Patients
Overview
This project is a full-stack assistive system designed to support individuals with Alzheimer’s by helping them recognize people, recall important information, and assist caregivers with real-time insights.
The system combines:
A Raspberry Pi-based wearable device (camera + audio output)
A caregiver dashboard (web app)
A voice-enabled AI assistant powered by ElevenLabs
Together, these components create a memory support ecosystem that enhances daily interactions and reduces confusion for patients.
🚀 Key Features
👤 Face Recognition (Wearable Device)
Detects and recognizes known individuals in real-time
Uses multiple images per person for improved accuracy
Outputs contextual audio:
“This is your daughter, Sarah”
🧾 Caregiver Dashboard (Web App)
A centralized platform for managing patient data and system behavior.
Features:
Add/edit people profiles
Name, relationship, notes, memory cues
Upload multiple images per person
Manage reminders
Medication schedules
Appointments
View recognition history
Track activity logs
🔊 Voice Assistant (Accessibility Feature)
A voice-enabled assistant for caregivers built using ElevenLabs.
Capabilities:
Ask natural language questions:
“What reminders are scheduled today?”
“Who was recognized recently?”
Retrieves real-time data from backend
Responds with structured, spoken answers
🧠 Intelligent Memory System
Prioritizes critical information:
Medication
Appointments
Provides structured responses
Avoids hallucination by using only backend data
🏗️ System Architecture
Wearable Device (Raspberry Pi)
        ↓
Camera Input → Face Recognition → Audio Output
        ↓
-----------------------------------------**
        ↓
Web Dashboard (Next.js)
        ↓
Backend API (/api/assistant)
        ↓
Database (MongoDB / Local Storage)
        ↓
ElevenLabs API
   ↙            ↘
STT              TTS
(Speech→Text)    (Text→Speech)
🛠️ Tech Stack
Hardware
Raspberry Pi Zero 2 W
Raspberry Pi Camera Module 3
MAX98357A I2S Amplifier
LiPo Battery + Power Modules
Software
Frontend
Next.js
React
Backend
Next.js API Routes
Firebase (Firestore for database and Firebase Storage for media)
AI & Voice
ElevenLabs API
Speech-to-Text (STT)
Text-to-Speech (TTS)
Computer Vision
OpenCV / face_recognition (Python)
🔑 API Integration (ElevenLabs)
Setup
Create a .env.local file:
ELEVENLABS_API_KEY=your_api_key_here
Example: Text-to-Speech API
const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/VOICE_ID", {
  method: "POST",
  headers: {
    "xi-api-key": process.env.ELEVENLABS_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    text: "You have 2 reminders today",
    model_id: "eleven_monolingual_v1",
  }),
});
🎤 Voice Assistant Flow
Caretaker speaks
↓
STT (ElevenLabs)
↓
Backend (/api/assistant)
↓
Database query (reminders, logs, faces)
↓
Structured response
↓
TTS (ElevenLabs)
↓
Audio playback
📦 Project Structure
/app
  /api
    /assistant
    /tts
    /stt
  /components
  /pages

/backend
  /models
  /routes

/device
  face_recognition.py
  camera_stream.py
🧪 Example Queries
“What reminders are scheduled today?”
“Who was recognized most recently?”
“Show me today’s activity”
“Are there any important events?”
⚠️ Design Considerations
Privacy
All data is stored locally or securely
No unnecessary recording of conversations
Caregiver-controlled access
Reliability
System avoids guessing
Only uses verified backend data
Structured responses reduce confusion
Accessibility
Voice interface for ease of use
Clear, calm, and concise responses
🔮 Future Improvements
Emotion-aware detection
Context-aware reminders
Mobile app integration
Real-time cloud sync
Adaptive learning from caregiver feedback
💡 Inspiration
This project is designed to address real challenges faced by Alzheimer’s patients:
Difficulty recognizing familiar people
Forgetting important tasks
Confusion in social situations
By combining computer vision, voice AI, and caregiver tools, we aim to create a meaningful assistive solution.
👥 Authors
[Your Name]
📄 License
MIT License
