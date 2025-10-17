import os
import aiohttp
from typing import Dict, Any

class VAPIClient:
    def __init__(self):
        self.api_key = os.getenv("VAPI_API_KEY")
        self.base_url = "https://api.vapi.ai/call"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def create_call(self, phone_number: str, restaurant_id: str) -> Dict[str, Any]:
        """
        Initiates a call using VAPI
        """
        async with aiohttp.ClientSession() as session:
            payload = {
                "phoneNumber": phone_number,
                "metadata": {
                    "restaurant_id": restaurant_id
                },
                "config": {
                    "speechRecognition": {
                        "provider": "deepgram"
                    },
                    "synthesizer": {
                        "provider": "elevenlabs",  # Using ElevenLabs for higher quality voice
                        "voice_id": os.getenv("ELEVENLABS_VOICE_ID")
                    }
                },
                "firstMessage": "Hello! Welcome to our restaurant. How may I help you today?"
            }
            
            async with session.post(
                self.base_url,
                json=payload,
                headers=self.headers
            ) as response:
                return await response.json()

    async def send_message(self, call_id: str, message: str) -> Dict[str, Any]:
        """
        Sends a message during an active call
        """
        async with aiohttp.ClientSession() as session:
            payload = {
                "text": message
            }
            
            async with session.post(
                f"{self.base_url}/{call_id}/send-message",
                json=payload,
                headers=self.headers
            ) as response:
                return await response.json()

    async def end_call(self, call_id: str) -> Dict[str, Any]:
        """
        Ends an active call
        """
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/{call_id}/end",
                headers=self.headers
            ) as response:
                return await response.json()