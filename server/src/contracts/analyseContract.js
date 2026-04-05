/**
 * analyseContract.js
 *
 * Canonical upload and analysis-response contract for the backend.
 * All upload validation and response schemas should be anchored here.
 *
 * Owner: Team Lead (Ayush)
 * Version: 1.0.0
 *
 * Responsibilities:
 * - define shared enums used across upload flows
 * - keep media constraints centralized and versioned
 * - expose payload builders for consistent API responses
 *
 * Team handoff notes:
 * - rPPG specialist: populate rppg_result in createAnalysisResult consumers
 * - geometry specialist: populate geometry_result in createAnalysisResult consumers
 * - data workflow owner: UploadMetadataShape and FileConstraints are the current baseline
 *
 * Team review checklist:
 * - if constraints change, update frontend hints and error map
 * - if enum values change, verify routes/controller parsing
 * - if schema fields change, bump schema version intentionally
 */
const crypto = require("crypto");

const SCHEMA_VERSION = "1.0.0";

// -----------------------------------------------------------------------------
// Enumerations shared across modules.
// -----------------------------------------------------------------------------
const MediaType = Object.freeze({
    VIDEO: "video",
    AUDIO: "audio",
    IMAGE: "image",
});

const AnalysisStatus = Object.freeze({
    QUEUED: "queued",
    PROCESSING: "processing",
    COMPLETED: "completed",
    FAILED: "failed",
});

const Verdict = Object.freeze({
    REAL: "real",
    FAKE: "fake",
    INCONCLUSIVE: "inconclusive",
});

// Canonical upload limits and MIME allowlists by media type.
const FILE_CONSTRAINTS = Object.freeze({
    [MediaType.VIDEO]: Object.freeze({
        maxMb: 200,
        allowedMimes: Object.freeze([
            "video/mp4",
            "video/webm",
            "video/quicktime",
            "video/x-msvideo",
            "video/x-matroska",
            "video/3gpp",
        ]),
        videoMinSecs: 3,
        videoMaxSecs: 120,
        videoMinFps: 15,
    }),
    [MediaType.AUDIO]: Object.freeze({
        maxMb: 50,
        allowedMimes: Object.freeze([
            "audio/wav",
            "audio/mpeg",
            "audio/mp4",
            "audio/ogg",
            "audio/x-wav",
            "audio/webm",
        ]),
        videoMinSecs: null,
        videoMaxSecs: null,
        videoMinFps: null,
    }),
    [MediaType.IMAGE]: Object.freeze({
        maxMb: 20,
        allowedMimes: Object.freeze([
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/jpg",
            "image/bmp",
            "image/heic",
        ]),
        videoMinSecs: null,
        videoMaxSecs: null,
        videoMinFps: null,
    }),
});

const FileConstraints = FILE_CONSTRAINTS;

// Client-provided metadata schema accepted by the upload API.
const UploadMetadataShape = Object.freeze({
    source_label: Object.freeze({ type: "string", maxLength: 120, nullable: true }),
    expected_real: Object.freeze({ type: "boolean", nullable: true }),
});

function createRPPGResult(overrides = {}) {
    return {
        bpm_estimate: null,
        signal_quality: null,
        spatial_coherence: null,
        is_biological: null,
        confidence: null,
        ppg_map_url: null,
        failure_reason: null,
        ...overrides,
    };
}

function createGeometryResult(overrides = {}) {
    return {
        ear_mean: null,
        blink_rate_per_min: null,
        landmark_jitter: null,
        lip_nose_coupling: null,
        anomaly_score: null,
        confidence: null,
        landmark_map_url: null,
        failure_reason: null,
        ...overrides,
    };
}

function isValidMediaType(mediaType) {
    return Object.values(MediaType).includes(mediaType);
}

function maxBytes(mediaType) {
    const constraints = FILE_CONSTRAINTS[mediaType];
    if (!constraints) return null;
    return constraints.maxMb * 1024 * 1024;
}

function allowedMimes(mediaType) {
    const constraints = FILE_CONSTRAINTS[mediaType];
    return constraints ? [...constraints.allowedMimes] : [];
}

function isAllowedMime(mediaType, mimeType) {
    if (!mimeType) return false;
    const lowerMime = String(mimeType).toLowerCase();
    return allowedMimes(mediaType).includes(lowerMime);
}

function getConstraints(mediaType) {
    const constraints = FILE_CONSTRAINTS[mediaType];
    if (!constraints) return null;

    return {
        media_type: mediaType,
        maxMb: constraints.maxMb,
        maxBytes: maxBytes(mediaType),
        allowedMimes: [...constraints.allowedMimes],
        videoMinSecs: constraints.videoMinSecs,
        videoMaxSecs: constraints.videoMaxSecs,
        videoMinFps: constraints.videoMinFps,
    };
}

function getAllConstraints() {
    return Object.values(MediaType).reduce((acc, mediaType) => {
        acc[mediaType] = getConstraints(mediaType);
        return acc;
    }, {});
}

function validateUploadMetadata(rawMetadata) {
    if (rawMetadata === undefined || rawMetadata === null || rawMetadata === "") {
        return { value: {} };
    }

    let parsedMetadata = rawMetadata;
    if (typeof rawMetadata === "string") {
        try {
            parsedMetadata = JSON.parse(rawMetadata);
        } catch (error) {
            return { error: "metadata must be valid JSON" };
        }
    }

    if (typeof parsedMetadata !== "object" || Array.isArray(parsedMetadata)) {
        return { error: "metadata must be a JSON object" };
    }

    const normalized = {};

    if (parsedMetadata.source_label !== undefined) {
        if (typeof parsedMetadata.source_label !== "string") {
            return { error: "metadata.source_label must be a string" };
        }

        if (parsedMetadata.source_label.length > 120) {
            return { error: "metadata.source_label cannot exceed 120 characters" };
        }

        normalized.source_label = parsedMetadata.source_label;
    }

    if (parsedMetadata.expected_real !== undefined) {
        if (typeof parsedMetadata.expected_real !== "boolean") {
            return { error: "metadata.expected_real must be a boolean" };
        }

        normalized.expected_real = parsedMetadata.expected_real;
    }

    return { value: normalized };
}

function createAnalysisTask({ taskId, mediaType, status, message, pollUrl }) {
    return {
        task_id: taskId || crypto.randomUUID(),
        media_type: mediaType || null,
        status: status || AnalysisStatus.QUEUED,
        message: message || "Upload accepted. Analysis queued.",
        poll_url: pollUrl || "",
    };
}

function createAnalysisResult({
    taskId,
    status,
    mediaType,
    verdict = null,
    confidence = null,
    processingMs = null,
    rppgResult = null,
    geometryResult = null,
    heatmapUrl = null,
    reportUrl = null,
    errorCode = null,
    errorDetail = null,
}) {
    return {
        task_id: taskId || crypto.randomUUID(),
        status: status || AnalysisStatus.FAILED,
        media_type: mediaType || null,
        verdict,
        confidence,
        processing_ms: processingMs,
        rppg_result: rppgResult,
        geometry_result: geometryResult,
        heatmap_url: heatmapUrl,
        report_url: reportUrl,
        error_code: errorCode,
        error_detail: errorDetail,
        schema_version: SCHEMA_VERSION,
    };
}

function createFailureAnalysisResult({ taskId, mediaType, errorCode, errorDetail }) {
    return createAnalysisResult({
        taskId,
        status: AnalysisStatus.FAILED,
        mediaType,
        errorCode,
        errorDetail,
    });
}

module.exports = {
    SCHEMA_VERSION,
    MediaType,
    AnalysisStatus,
    Verdict,
    FileConstraints,
    UploadMetadataShape,
    getConstraints,
    getAllConstraints,
    isValidMediaType,
    allowedMimes,
    maxBytes,
    isAllowedMime,
    validateUploadMetadata,
    createAnalysisTask,
    createRPPGResult,
    createGeometryResult,
    createAnalysisResult,
    createFailureAnalysisResult,
};
