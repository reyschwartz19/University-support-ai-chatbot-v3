import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
print(f"API Key found: {bool(api_key)}")

if api_key:
    genai.configure(api_key=api_key)
    try:
        model = genai.GenerativeModel('models/gemini-2.0-flash')
        print("Model initialized.")
        response = model.generate_content("Hello, this is a test.")
        print(f"Response: {response.text}")
        print("Gemini API is working correctly!")
    except Exception as e:
        print(f"Error: {e}")
else:
    print("No API key found in logic.")
