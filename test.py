import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

print("Asking Google a simple text question...")
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Hello! What is 2 + 2? Reply in one sentence."
)
print("Google says:", response.text)