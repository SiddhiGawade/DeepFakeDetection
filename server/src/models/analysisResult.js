const mongoose = require("mongoose");

const analysisResultSchema = new mongoose.Schema(
    {
        file_hash: { type: String, required: true, unique: true },
        file_type: { type: String, enum: ["image", "video", "audio"], required: true },
        original_name: { type: String },
        mime_type: { type: String },
        file_size: { type: Number },
        file_url: { type: String, default: null },   // S3 url — Phase 5
        prediction: { type: Number, default: null },
        confidence: { type: String, default: null },
        metrics: { type: mongoose.Schema.Types.Mixed, default: {} }, // flexible for all 3 model types
        error_code: { type: String, default: null },
        error_detail: { type: String, default: null },
    },
    { timestamps: true } // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model("AnalysisResult", analysisResultSchema);
