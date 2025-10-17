from utils.elevenlabs_client import ElevenLabsClient

if __name__ == "__main__":
    client = ElevenLabsClient()
    text = "Hello! This is a test of the ElevenLabs voice synthesis integration."
    output_path = "test_output.mp3"
    try:
        result = client.synthesize(text, output_path)
        print(f"Audio file generated: {result}")
    except Exception as e:
        print(f"Error: {e}")
