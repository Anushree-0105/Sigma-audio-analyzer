const mongoose = require('mongoose');

const callRecordSchema = new mongoose.Schema({
    // Basic IT/Telecom Data
    callId: { type: String, required: true, unique: true },
    staffName: { type: String, required: true },
    staffExtension: { type: String },
    callerNumber: { type: String },
    callType: { type: String, enum: ['Inbound', 'Outbound', 'Missed'], default: 'Inbound' },
    durationSeconds: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now },
    
    // File Storage
    recordingUrl: { type: String }, // Temporary URL from the PBX
    localFilePath: { type: String }, // Where we save it on our server/S3
    
    // Python AI Extraction Data (Filled in later)
    isProcessedByAI: { type: Boolean, default: false },
    outcome: { type: String, default: 'Pending' }, // Admitted, Interested, etc.
    sentiment: { type: String, default: 'Neutral' }, // Positive, Neutral, Negative
    qualityScore: { type: Number, min: 0, max: 5, default: 0 },
    summary: { type: String },
    transcription: { type: String }
});

module.exports = mongoose.model('CallRecord', callRecordSchema);