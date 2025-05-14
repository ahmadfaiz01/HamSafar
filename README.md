# HamSafar - AI-Driven Travel Planner and Guide

HamSafar is an intelligent travel planning web platform that integrates AI-driven recommendations, real-time ticket and weather data, personalized itineraries, and an interactive chatbot.

## Features

- 🤖 AI-Driven Recommendations
- 🎫 Real-time Ticket & Weather Data
- 📅 Personalized Itineraries
- 💬 Interactive Chatbot
- 🗺️ Interactive Maps
- 👤 User Profiles & Analytics

## Tech Stack

### Frontend
- React.js
- Bootstrap
- Leaflet (Maps)
- Google Generative AI (Chatbot)
- React Router
- Axios

### Backend
- Node.js + Express.js
- MongoDB
- Firebase (Authentication)
- External APIs:
  - Google Flights/Skyscanner
  - Amadeus
  - Leaflet Maps
  - Gemini AI

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install-all
   ```
3. Set up environment variables:
   - Create `.env` file in server directory
   - Add required API keys and configuration

4. Start the development servers:
   ```bash
   npm run dev
   ```

## Project Structure

```
hamsafar/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
│   └── public/           # Static files
│
└── server/               # Node.js backend
    ├── controllers/     # Route controllers
    ├── models/         # MongoDB models
    ├── routes/         # API routes
    └── services/       # Business logic
```

## Team Members

- Muhammad Ahmad
- Arham Ali
## License

MIT 
