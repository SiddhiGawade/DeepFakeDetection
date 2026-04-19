const fs = require("fs/promises");
const crypto = require("crypto");
const { generateFileHash } = require("../utils/hashGenerator");
const { getCachedResult, setCachedResult } = require("../services/cacheService");
const { getPrediction } = require("../services/modelService");
const AnalysisResult = require("../models/analysisResult");
const { probeVideo } = require("../utils/videoMetadata");
const { uploadToCloud } = require("../services/storageService");
const {
    SCHEMA_VERSION,
    MediaType,
    AnalysisStatus,
    getConstraints,
    getAllConstraints,
    isValidMediaType,
    isAllowedMime,
    maxBytes,
    validateUploadMetadata,
    createAnalysisTask,
    createAnalysisResult,
    createFailureAnalysisResult,
} = require("../contracts/analyseContract");

async function removeFileIfExists(filePath) {
    if (!filePath) return;
    try { await fs.unlink(filePath); } catch { }
}

function buildFailureResponse({ statusCode, taskId, mediaType, errorCode, errorDetail, message }) {
    return {
        statusCode,
        body: {
            success: false,
            message,
            data: createFailureAnalysisResult({ taskId, mediaType, errorCode, errorDetail }),
        },
    };
}

function sendFailure(res, payload) {
    const failure = buildFailureResponse(payload);
    return res.status(failure.statusCode).json(failure.body);
}

function normalizeMediaType(value) {
    return String(value || "").trim().toLowerCase();
}

function parseUploadMetadata(rawMetadata) {
    const validation = validateUploadMetadata(rawMetadata);
    if (validation.error) {
        return { error: { code: "INVALID_METADATA", detail: validation.error } };
    }
    return { value: validation.value || {} };
}

function normalizeCachedResult(cached, mediaType, task) {
    if (!cached || typeof cached !== "object") return cached;
    return {
        ...cached,
        task_id: cached.task_id || task.task_id,
        media_type: cached.media_type || mediaType,
        status: cached.status || AnalysisStatus.COMPLETED,
        schema_version: cached.schema_version || SCHEMA_VERSION,
        error_code: cached.error_code || null,
        error_detail: cached.error_detail || null,
    };
}

async function validateVideoRules(filePath, mediaType) {
    const constraints = getConstraints(mediaType);
    if (!constraints) return { errorCode: "INVALID_MEDIA_TYPE", errorDetail: "Unknown media_type.", statusCode: 400 };

    let metadata;
    try {
        metadata = await probeVideo(filePath);
    } catch {
        return { errorCode: "VIDEO_METADATA_UNAVAILABLE", errorDetail: "Unable to validate video duration/FPS.", statusCode: 400 };
    }

    if (metadata.durationSeconds !== null && metadata.durationSeconds < constraints.videoMinSecs)
        return { errorCode: "VIDEO_TOO_SHORT", errorDetail: `Video must be at least ${constraints.videoMinSecs}s.`, statusCode: 400 };

    if (metadata.durationSeconds !== null && constraints.videoMaxSecs !== null && metadata.durationSeconds > constraints.videoMaxSecs)
        return { errorCode: "VIDEO_TOO_LONG", errorDetail: `Video cannot exceed ${constraints.videoMaxSecs}s.`, statusCode: 400 };

    if (metadata.fps !== null && metadata.fps < constraints.videoMinFps)
        return { errorCode: "VIDEO_FPS_TOO_LOW", errorDetail: `Video FPS must be at least ${constraints.videoMinFps}.`, statusCode: 400 };

    return { metadata };
}

const getUploadConstraintsResponse = (req, res) => {
    const mediaType = normalizeMediaType(req.query.media_type);
    if (mediaType && !isValidMediaType(mediaType)) {
        return sendFailure(res, { statusCode: 400, taskId: crypto.randomUUID(), mediaType: null, errorCode: "INVALID_MEDIA_TYPE", errorDetail: "media_type must be one of: image, audio, video.", message: "Invalid media_type" });
    }
    const data = mediaType ? getConstraints(mediaType) : getAllConstraints();
    return res.status(200).json({ success: true, message: "Upload constraints fetched", schema_version: SCHEMA_VERSION, data });
};

const getUploadStatus = (req, res) => {
    const mediaType = normalizeMediaType(req.query.media_type);
    const statusPayload = createAnalysisResult({ taskId: req.params.taskId, status: AnalysisStatus.QUEUED, mediaType: isValidMediaType(mediaType) ? mediaType : null });
    return res.status(200).json({ success: true, message: "Status endpoint placeholder", data: statusPayload });
};

const handleUploadMiddlewareError = (req, res, error) => {
    const mediaType = normalizeMediaType(req.body?.media_type);
    const resolvedMediaType = isValidMediaType(mediaType) ? mediaType : null;
    const taskId = crypto.randomUUID();

    if (error?.code === "LIMIT_FILE_SIZE") {
        const constraints = resolvedMediaType ? getConstraints(resolvedMediaType) : null;
        const detail = constraints ? `File exceeds ${constraints.maxMb}MB limit for ${resolvedMediaType}.` : "File exceeds the maximum allowed size.";
        return sendFailure(res, { statusCode: 413, taskId, mediaType: resolvedMediaType, errorCode: "FILE_TOO_LARGE", errorDetail: detail, message: "Upload rejected" });
    }

    if (String(error?.message || "").toLowerCase().includes("unsupported file type")) {
        return sendFailure(res, { statusCode: 400, taskId, mediaType: resolvedMediaType, errorCode: "INVALID_MIME_TYPE", errorDetail: "Unsupported MIME type uploaded.", message: "Upload rejected" });
    }

    return sendFailure(res, { statusCode: 400, taskId, mediaType: resolvedMediaType, errorCode: "UPLOAD_VALIDATION_FAILED", errorDetail: error?.message || "Upload middleware validation failed.", message: "Upload rejected" });
};

const uploadFile = async (req, res) => {
    const taskId = crypto.randomUUID();
    const mediaType = normalizeMediaType(req.body?.media_type);

    if (!isValidMediaType(mediaType)) {
        await removeFileIfExists(req.file?.path);
        return sendFailure(res, { statusCode: 400, taskId, mediaType: null, errorCode: "INVALID_MEDIA_TYPE", errorDetail: "media_type must be one of: image, audio, video.", message: "Upload rejected" });
    }

    if (!req.file) {
        return sendFailure(res, { statusCode: 400, taskId, mediaType, errorCode: "NO_FILE_UPLOADED", errorDetail: "No file was received in the request.", message: "Upload rejected" });
    }

    const metadata = parseUploadMetadata(req.body?.metadata);
    if (metadata.error) {
        await removeFileIfExists(req.file.path);
        return sendFailure(res, { statusCode: 400, taskId, mediaType, errorCode: metadata.error.code, errorDetail: metadata.error.detail, message: "Upload rejected" });
    }

    if (!isAllowedMime(mediaType, req.file.mimetype)) {
        await removeFileIfExists(req.file.path);
        return sendFailure(res, { statusCode: 400, taskId, mediaType, errorCode: "INVALID_MIME_TYPE", errorDetail: `MIME type ${req.file.mimetype} is not allowed for ${mediaType}.`, message: "Upload rejected" });
    }

    const allowedBytes = maxBytes(mediaType);
    if (allowedBytes !== null && req.file.size > allowedBytes) {
        const constraints = getConstraints(mediaType);
        await removeFileIfExists(req.file.path);
        return sendFailure(res, { statusCode: 413, taskId, mediaType, errorCode: "FILE_TOO_LARGE", errorDetail: `File exceeds ${constraints.maxMb}MB limit for ${mediaType}.`, message: "Upload rejected" });
    }

    if (mediaType === MediaType.VIDEO) {
        const videoValidation = await validateVideoRules(req.file.path, mediaType);
        if (videoValidation.errorCode) {
            await removeFileIfExists(req.file.path);
            return sendFailure(res, { statusCode: videoValidation.statusCode, taskId, mediaType, errorCode: videoValidation.errorCode, errorDetail: videoValidation.errorDetail, message: "Upload rejected" });
        }
    }

    const fileHash = generateFileHash(req.file.path);
    const task = createAnalysisTask({ taskId, mediaType, pollUrl: `/api/upload/status/${taskId}?media_type=${mediaType}` });

    const cached = await getCachedResult(fileHash);
    if (cached) {
        const cachedPayload = normalizeCachedResult(cached, mediaType, task);
        return res.status(200).json({ success: true, message: "Result served from cache", fromCache: true, data: cachedPayload });
    }

    // Upload to Cloudinary AFTER hashing (this deletes the local file)
    const fileUrl = await uploadToCloud(req.file.path, mediaType);

    // Call the correct AI model based on file type
    const prediction = await getPrediction(req.file.mimetype, fileUrl, { taskId });
    const isVideoMedia = mediaType === MediaType.VIDEO;
    const normalizedVideoPrediction = isVideoMedia && prediction && typeof prediction === "object"
        ? prediction
        : null;

    const result = {
        ...task,
        status: normalizedVideoPrediction?.status || task.status,
        schema_version: SCHEMA_VERSION,
        originalName: req.file.originalname,
        savedAs: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        hash: fileHash,
        file_url: fileUrl,
        metadata: metadata.value,
        prediction: normalizedVideoPrediction ? normalizedVideoPrediction.prediction : prediction.prediction,
        confidence: normalizedVideoPrediction ? normalizedVideoPrediction.confidence : prediction.confidence,
        type: normalizedVideoPrediction ? normalizedVideoPrediction.type : prediction.type,
        verdict: normalizedVideoPrediction ? normalizedVideoPrediction.verdict : prediction.verdict,
        is_fake: prediction.is_fake,
        probabilities: prediction.probabilities,
        reasons: prediction.reasons,
        analysis: normalizedVideoPrediction ? normalizedVideoPrediction.analysis : prediction.analysis,
        rppg_result: normalizedVideoPrediction ? normalizedVideoPrediction.rppg_result : null,
        geometry_result: normalizedVideoPrediction ? normalizedVideoPrediction.geometry_result : null,
        stage_details: normalizedVideoPrediction?.stage_details,
        heatmap_url: null,
        report_url: null,
        error_code: normalizedVideoPrediction?.error_code || null,
        error_detail: normalizedVideoPrediction?.error_detail || null,
    };

    await setCachedResult(fileHash, result);

    // Save to MongoDB (skip if hash already exists)
    await AnalysisResult.findOneAndUpdate(
        { file_hash: fileHash },
        {
            file_hash: fileHash,
            file_type: mediaType,
            file_url: fileUrl,
            original_name: req.file.originalname,
            mime_type: req.file.mimetype,
            file_size: req.file.size,
            prediction: result.prediction,
            confidence: result.confidence,
            metrics: {
                analysis: result.analysis,
                rppg_result: result.rppg_result,
                geometry_result: result.geometry_result,
            },
            error_code: result.error_code,
            error_detail: result.error_detail,
        },
        { upsert: true, new: true }
    );


    return res.status(200).json({ success: true, message: "File analysed successfully", fromCache: false, data: result });
};

module.exports = { uploadFile, getUploadConstraintsResponse, getUploadStatus, handleUploadMiddlewareError };
