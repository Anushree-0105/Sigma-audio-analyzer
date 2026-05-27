import sys
import json
import pymongo
from bson.objectid import ObjectId
from google import genai
from google.genai import types

# Force Windows UTF-8 output
if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

# ─── CONFIGURE GEMINI ───
API_KEY = "AIzaSyAl0C7HELlRZB3AlaUBlL-x7zJOsyTatWQ"  # Paste your actual key here
client = genai.Client(api_key=API_KEY)

def analyze_call(record_id, audio_file_path):
    print(f"[START] AI Lead Extraction for Record ID: {record_id}")
    
    # Connect to MongoDB
    mongo_client = pymongo.MongoClient('mongodb://127.0.0.1:27017/admissions_ai')
    db = mongo_client.get_database()
    calls_collection = db['callrecords']

    try:
        print("[INFO] Uploading audio directly to Gemini...")
        audio_file = client.files.upload(file=audio_file_path)
        
        print("[INFO] Extracting structured student data...")
        prompt = "Analyze this admission call (Hindi/Gujarati/English). Extract lead details. Predict college visit."
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[audio_file, prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema={
                    "type": "OBJECT",
                    "properties": {
                        "name": {"type": "STRING"}, "city": {"type": "STRING"},
                        "state": {"type": "STRING"}, "education": {"type": "STRING"},
                        "school": {"type": "STRING"}, "year": {"type": "STRING"},
                        "percent": {"type": "STRING"}, "course": {"type": "STRING"},
                        "fees": {"type": "STRING"}, "counselor": {"type": "STRING"},
                        "remark": {"type": "STRING"}, "visit_prediction": {"type": "STRING"}
                    },
                    "required": ["name", "course", "visit_prediction", "counselor"]
                }
            )
        )

        data = json.loads(response.text)
        
        # --- STAR LOGIC ---
        check_fields = [
            "counselor", "name", "city", "state", "education", 
            "course", "school", "year", "percent", "fees", 
            "visit_prediction", "remark"
        ]
        valid_info_count = sum(1 for f in check_fields if data.get(f) and str(data.get(f)).lower() not in ["n/a", "unknown", "none", "null"])
        
        stars = "⭐"
        if valid_info_count >= 11: stars = "⭐⭐⭐⭐⭐"
        elif 9 <= valid_info_count <= 10: stars = "⭐⭐⭐⭐"
        elif 7 <= valid_info_count <= 8: stars = "⭐⭐⭐"
        elif 5 <= valid_info_count <= 6: stars = "⭐⭐"

        print(f"[SUCCESS] Extracted Lead: {data.get('name', 'Unknown')} | Score: {stars}")

        # Update MongoDB with the new Student Data
        calls_collection.update_one(
            {"_id": ObjectId(record_id)},
            {"$set": {
                "isProcessedByAI": True,
                "studentName": data.get("name", "Unknown"),
                "counselorName": data.get("counselor", "Unknown"),
                "city": data.get("city", "N/A"),
                "state": data.get("state", "N/A"),
                "education": data.get("education", "N/A"),
                "course": data.get("course", "N/A"),
                "school": data.get("school", "N/A"),
                "passoutYear": data.get("year", "N/A"),
                "percentage": data.get("percent", "N/A"),
                "feesDiscussed": data.get("fees", "No"),
                "visitPrediction": data.get("visit_prediction", "N/A"),
                "remark": data.get("remark", "N/A"),
                "starRating": stars
            }}
        )
        print("[DONE] MongoDB Record Updated Successfully!")

    except Exception as e:
        print(f"[ERROR] processing failed: {e}")
    finally:
        mongo_client.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.exit(1)
    analyze_call(sys.argv[1], sys.argv[2])