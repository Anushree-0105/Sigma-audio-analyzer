// server.js
require('dotenv').config({ quiet: true });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { spawn } = require('child_process');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

// ─── SECURITY & AUTHENTICATION ──────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'sigma_super_secret_key_2026';

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'sigma123') {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '8h' });
        res.status(200).json({ token });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access Denied' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid Token' });
        req.user = user;
        next();
    });
};

// ─── MONGODB SETUP ──────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('❌ Missing required environment variable: MONGODB_URI');
    process.exit(1);
}

mongoose.connect(MONGODB_URI)
    .then(() => console.log('📦 Connected to MongoDB successfully!'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

const callRecordSchema = new mongoose.Schema({
    callId: { type: String, required: true, unique: true },
    staffName: String,
    staffExtension: String,
    callerNumber: String,
    callType: String,
    durationSeconds: Number,
    recordingUrl: String,
    localFilePath: String,
}, { strict: false, timestamps: true });

const CallRecord = mongoose.model('CallRecord', callRecordSchema);

// ─── FILE UPLOAD & SERVING SETUP ────────────────────────────────
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'))
});
const upload = multer({ storage });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── PROTECTED ENDPOINTS ────────────────────────────────────────

// 1. Fetch Data
app.get('/api/calls', authenticateToken, async (req, res) => {
    try {
        const calls = await CallRecord.find().sort({ createdAt: -1 }); 
        res.status(200).json(calls);
    } catch (error) {
        console.error("❌ Error fetching calls:", error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

// 2. Manual Upload
app.post('/api/upload-audio', authenticateToken, upload.single('audioFile'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send({ error: "No file uploaded" });
        console.log(`\n📁 File received: ${req.file.filename}`);

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
        res.status(200).send({ message: "File uploaded successfully!", recordId: savedRecord._id });

        console.log(`⚙️ Starting Python AI on uploaded file: ${req.file.path}`);
        const pythonProcess = spawn('python', ['-u', 'process_audio.py', savedRecord._id.toString(), req.file.path]);

        pythonProcess.stdout.on('data', (data) => console.log(`[PYTHON]: ${data.toString().trim()}`));
        pythonProcess.stderr.on('data', (data) => console.error(`[PYTHON ERROR]: ${data.toString().trim()}`));
        
        pythonProcess.on('close', (code) => {
            if (code !== 0) console.log(`❌ Python script crashed with exit code ${code}`);
            else console.log(`✅ Python script completed successfully.`);
        });
        
    } catch (error) {
        console.error("❌ Upload error:", error);
        res.status(500).send({ error: "Upload failed" });
    }
});

// 3. Delete Record (CRASH-PROOF VERSION)
app.delete('/api/calls/:id', authenticateToken, async (req, res) => {
    try {
        const targetId = req.params.id;
        let deletedRecord = null;

        // Step 1: Safely try finding by the manual callId
        deletedRecord = await CallRecord.findOneAndDelete({ callId: targetId });
        
        // Step 2: If not found, safely try deleting by MongoDB's _id format
        if (!deletedRecord) {
            try {
                deletedRecord = await CallRecord.findByIdAndDelete(targetId);
            } catch (e) {
                // If MongoDB rejects the ID format, we silently catch it so the server doesn't crash!
            }
        }
        
        // Step 3: If neither worked, return a soft 404
        if (!deletedRecord) {
            return res.status(404).send({ error: "Record not found" });
        }
        
        console.log(`🗑️ Successfully deleted record: ${targetId}`);
        res.status(200).send({ message: "Record deleted successfully!" });

    } catch (error) {
        console.error("❌ Fatal Error deleting record:", error);
        res.status(500).send({ error: "Failed to delete record due to server error" });
    }
});

// ─── START SERVER ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`⏳ Waiting for files...\n`);
});