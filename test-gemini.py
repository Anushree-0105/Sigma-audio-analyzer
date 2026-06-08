import google.generativeai as genai

genai.configure(api_key="AQ.Ab8RN6LSCnm3R7PyXlVX5PTtkR4bme5qNGHfyTVxC0lVlp_5QQ")

model = genai.GenerativeModel("gemini-2.5-flash")

response = model.generate_content("Hello")

print(response.text)