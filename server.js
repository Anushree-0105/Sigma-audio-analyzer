// server.js
require('dotenv').config({ quiet: true });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { spawn } = require('child_process');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// ─── MONGODB SETUP ──────────────────────────────────────────────
mongoose.connect('mongodb://127.0.0.1:27017/admissions_ai')
    .then(() => console.log('📦 Connected to MongoDB successfully!'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// The schema is now set to { strict: false } so it accepts all the new Gemini fields!
const callRecordSchema = new mongoose.Schema({
    callId: { type: String, required: true, unique: true },
    staffName: String,
    staffExtension: String,
    callerNumber: String,
    callType: String,
    durationSeconds: Number,
    recordingUrl: String,
    localFilePath: String,
    // AI fields will be dynamically added here by Python
}, { strict: false, timestamps: true });

const CallRecord = mongoose.model('CallRecord', callRecordSchema);

// ─── FILE UPLOAD SETUP (MULTER) ─────────────────────────────────
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'))
});
const upload = multer({ storage });


// ─── ENDPOINT 1: REACT FETCH DATA ───────────────────────────────
// React calls this every 4 seconds to get the latest DB records
app.get('/api/calls', async (req, res) => {
    try {
        const calls = await CallRecord.find().sort({ createdAt: -1 }); // Newest first
        res.status(200).json(calls);
    } catch (error) {
        console.error("❌ Error fetching calls:", error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});


// ─── ENDPOINT 2: MANUAL AUDIO UPLOAD ────────────────────────────
// React sends .wav/.mp3 files here
app.post('/api/upload-audio', upload.single('audioFile'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send({ error: "No file uploaded" });

        console.log(`\n📁 File received: ${req.file.filename}`);

        // 1. Create a "Processing" record in MongoDB
        const newRecord = new CallRecord({
            callId: "MANUAL_" + Date.now(),
            staffName: req.body.staffName || "Manual Upload",
            callType: "Inbound",
            durationSeconds: 0,
            localFilePath: req.file.path,
            studentName: "Processing...",
            visitPrediction: "Processing...",
            starRating: "⏳",
            remark: "AI is analyzing this audio. Please wait..."
        });

        const savedRecord = await newRecord.save();

        // 2. Respond to React immediately so the loader stops spinning
        res.status(200).send({ message: "File uploaded successfully!", recordId: savedRecord._id });

        // 3. Trigger Python Gemini AI in the background
        console.log(`⚙️ Starting Python AI on uploaded file: ${req.file.path}`);
        const pythonProcess = spawn('python', ['process_audio.py', savedRecord._id.toString(), req.file.path]);

        pythonProcess.stdout.on('data', (data) => console.log(`[PYTHON]: ${data.toString().trim()}`));
        pythonProcess.stderr.on('data', (data) => console.error(`[PYTHON ERROR]: ${data.toString().trim()}`));
        
    } catch (error) {
        console.error("❌ Upload error:", error);
        res.status(500).send({ error: "Upload failed" });
    }
});


// ─── ENDPOINT 3: AUTOMATED WEBHOOK (For later) ──────────────────
// Telecom server sends JSON data here when a live call ends
app.post('/api/webhooks/call-ended', async (req, res) => {
    try {
        const callData = req.body;
        console.log("\n🔔 WEBHOOK RECEIVED! Processing call:", callData.callId);

        const newRecord = new CallRecord({
            callId: callData.callId,
            staffName: callData.staffName || "Unknown Telecommunicator",
            staffExtension: callData.extension,
            callerNumber: callData.callerNumber,
            callType: callData.callType,
            durationSeconds: callData.duration,
            recordingUrl: callData.recording_url,
            studentName: "Processing...",
            remark: "AI is analyzing the webhook audio..."
        });

        const savedRecord = await newRecord.save();
        console.log("✅ Successfully saved to MongoDB:", savedRecord._id);

        res.status(200).send({ message: "Webhook received and saved", recordId: savedRecord._id });

        // For webhooks, we would normally download the audio from the recordingUrl first.
        // For now, we point it to a dummy file to keep the pipeline intact.
        const audioFilePath = './dummy.mp3'; 
        
        console.log(`⚙️ Starting Python AI for Webhook ID: ${savedRecord._id}`);
        const pythonProcess = spawn('python', ['process_audio.py', savedRecord._id.toString(), audioFilePath]);

        pythonProcess.stdout.on('data', (data) => console.log(`[PYTHON]: ${data.toString().trim()}`));
        pythonProcess.stderr.on('data', (data) => console.error(`[PYTHON ERROR]: ${data.toString().trim()}`));

    } catch (error) {
        if (error.code === 11000) {
            console.log("⚠️ Duplicate call Webhook received. Ignoring.");
            return res.status(200).send({ message: "Call already logged." });
        }
        console.error("❌ Error processing webhook:", error.message);
        res.status(500).send({ error: "Internal Server Error" });
    }
});


// ─── START SERVER ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`⏳ Waiting for files or webhooks...\n`);
});