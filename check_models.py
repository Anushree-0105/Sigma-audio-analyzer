import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load the API key from your .env file
load_dotenv()
api_key = "AIzaSyAl0C7HELlRZB3AlaUBlL-x7zJOsyTatWQ"

if not api_key:
    print("❌ Error: Could not find GEMINI_API_KEY in your .env file.")
    exit()

# Configure the Gemini library
genai.configure(api_key=api_key)

print("🔍 Scanning for available Gemini models...\n")

# Loop through and print all models that support text/audio generation
for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        print(f"✅ {model.name}")