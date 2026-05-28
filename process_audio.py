import os
import sys
import json
import pymongo
import urllib.parse
from bson.objectid import ObjectId
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# Force Windows UTF-8 output
if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

# ─── CONFIGURE GEMINI ───
API_KEY = os.getenv('GEMINI_API_KEY')
MONGODB_URI = os.getenv('MONGODB_URI')

if not API_KEY:
    raise SystemExit('Missing required environment variable: GEMINI_API_KEY')
if not MONGODB_URI:
    raise SystemExit('Missing required environment variable: MONGODB_URI')

client = genai.Client(api_key=API_KEY)

def analyze_call(record_id, audio_file_path):
    print(f"[START] AI Lead Extraction for Record ID: {record_id}")
    
    try:
        # Extract the correct DB name from the URI
        parsed_uri = urllib.parse.urlparse(MONGODB_URI)
        db_name = parsed_uri.path.lstrip('/')
        if not db_name:
            db_name = 'test' 
            
        mongo_client = pymongo.MongoClient(MONGODB_URI)
        db = mongo_client[db_name]
        calls_collection = db['callrecords']
        print(f"[INFO] Connected to MongoDB database: {db_name}")

        print("[INFO] Uploading audio directly to Gemini...")
        audio_file = client.files.upload(file=audio_file_path)
        
        print("[INFO] Extracting structured student data...")
        prompt = "Analyze this admission call (Hindi/Gujarati/English). Extract lead details. Predict college visit."
        
        # 👈 FIXED: We must use a model that actually exists! 
        # Using gemini-2.0-flash as it is highly stable and avoids the 503 traffic jams of 2.5
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

        raw_text = response.text.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
            
        data = json.loads(raw_text.strip())
        
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

        update_result = calls_collection.update_one(
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
        if update_result.modified_count > 0:
            print(f"[DONE] MongoDB Record ({record_id}) Updated Successfully!")

    except json.JSONDecodeError as e:
        error_msg = "Failed to parse JSON from AI."
        print(f"[ERROR] {error_msg} Raw output: {response.text}")
        if 'calls_collection' in locals():
            calls_collection.update_one(
                {"_id": ObjectId(record_id)},
                {"$set": {"studentName": "Error", "visitPrediction": "Failed", "remark": error_msg, "starRating": "❌"}}
            )
            
    except Exception as e:
        error_msg = str(e)
        print(f"[ERROR] processing failed: {error_msg}")
        if 'calls_collection' in locals():
            calls_collection.update_one(
                {"_id": ObjectId(record_id)},
                {"$set": {
                    "isProcessedByAI": True,
                    "studentName": "API Error",
                    "counselorName": "N/A",
                    "visitPrediction": "Failed",
                    "remark": f"Failed: {error_msg[:150]}",
                    "starRating": "❌"
                }}
            )
            print("[INFO] Updated MongoDB with error status.")
            
    finally:
        if 'mongo_client' in locals():
            mongo_client.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("[ERROR] Missing arguments.")
        sys.exit(1)
    analyze_call(sys.argv[1], sys.argv[2])