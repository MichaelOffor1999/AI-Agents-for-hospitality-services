# AI Voice Ordering System Backend (FastAPI)

This backend powers the AI Voice Ordering MVP. It is built with FastAPI, MongoDB, and is designed for scalability and future feature expansion.

## Features
- Async FastAPI server
- MongoDB integration
- Models: Restaurant, Order, Transcript
- CRUD API routes
- Production-ready settings

## Setup
1. Create a `.env` file with your MongoDB URI and other secrets.
2. Install dependencies (see below).
3. Run the server: `uvicorn main:app --reload`

## Install dependencies
```sh
pip install fastapi uvicorn motor pydantic python-dotenv reportlab
```

## Project Structure
- `main.py` — FastAPI app entry point
- `models/` — Pydantic models
- `routes/` — API route handlers
- `utils/` — DB connection, helpers
- `.github/` — Copilot instructions

## Next Steps
- Implement CRUD endpoints
- Integrate Twilio/Vapi, Whisper, LLM, PDF, Dashboard
