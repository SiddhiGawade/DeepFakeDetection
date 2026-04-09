const { generateFileHash } = require("../utils/hashGenerator");
const { getCachedResult, setCachedResult } = require("../services/cacheService");
const { getPrediction } = require("../services/modelService");

const uploadFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No file uploaded",
        });
    }

    const fileHash = generateFileHash(req.file.path);

    // Check cache first
    const cached = await getCachedResult(fileHash);
    if (cached) {
        return res.status(200).json({
            success: true,
            message: "Result served from cache",
            fromCache: true,
            data: cached,
        });
    }

    // Call the correct AI model based on file type
    const prediction = await getPrediction(req.file.mimetype);

    const result = {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        hash: fileHash,
        prediction: prediction.prediction,
        confidence: prediction.confidence,
        type: prediction.type,
    };

    // Cache the result
    await setCachedResult(fileHash, result);

    return res.status(200).json({
        success: true,
        message: "File analysed successfully",
        fromCache: false,
        data: result,
    });
};

module.exports = { uploadFile };
