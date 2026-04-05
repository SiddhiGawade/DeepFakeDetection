const { generateFileHash } = require("../utils/hashGenerator");
const { getCachedResult, setCachedResult } = require("../services/cacheService");

const uploadFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No file uploaded",
        });
    }

    // Generate hash from the saved file
    const fileHash = generateFileHash(req.file.path);

    const cached = await getCachedResult(fileHash);
    if (cached) {
        return res.status(200).json({
            success: true,
            message: "Result served from cache",
            fromCache: true,
            data: cached,
        });
    }

    // No cache hit — placeholder for AI model call (Phase 3)
    const result = {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        hash: fileHash,
        prediction: null,   // AI model will fill this in Phase 3
        confidence: null,
    };

    // Store in cache for next time
    await setCachedResult(fileHash, result);

    return res.status(200).json({
        success: true,
        message: "File processed and cached",
        fromCache: false,
        data: result,
    });

    // return res.status(200).json({
    //     success: true,
    //     message: "File uploaded successfully",
    //     data: {
    //         originalName: req.file.originalname,
    //         savedAs: req.file.filename,
    //         size: req.file.size,
    //         mimeType: req.file.mimetype,
    //         path: req.file.path,
    //         hash: fileHash,
    //     },
    // });
};

module.exports = { uploadFile };
