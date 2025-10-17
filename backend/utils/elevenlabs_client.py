import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()

class ElevenLabsClient:
    def __init__(self):
        self.api_key = os.getenv("ELEVENLABS_API_KEY")
        self.voice_id = os.getenv("ELEVENLABS_VOICE_ID")
        self.base_url = f"https://api.elevenlabs.io/v1/text-to-speech/{self.voice_id}"
        self.headers = {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json"
        }

    def synthesize(self, text: str, output_path: str) -> str:
        """
        Synthesizes speech from text and saves to output_path (mp3)
        Returns the path to the saved audio file
        """
        payload = {
            "text": text,
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75
            }
        }
        response = requests.post(self.base_url, headers=self.headers, json=payload)
        if response.status_code == 200:
            with open(output_path, "wb") as f:
                f.write(response.content)
            return output_path
        else:
            raise Exception(f"ElevenLabs synthesis failed: {response.text}")
