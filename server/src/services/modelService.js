const axios = require("axios");
const {
    AnalysisStatus,
    MediaType,
    createAnalysisResult,
    createGeometryResult,
    createRPPGResult,
} = require("../contracts/analyseContract");

const VIDEO_STAGES = Object.freeze({
    FACEMESH: "facemesh",
    RPPG: "rppg",
    FUSION: "fusion",
});

const STAGE_FAILURE_CODES = Object.freeze({
    [VIDEO_STAGES.FACEMESH]: "VIDEO_FACEMESH_FAILED",
    [VIDEO_STAGES.RPPG]: "VIDEO_RPPG_FAILED",
    [VIDEO_STAGES.FUSION]: "VIDEO_FUSION_FAILED",
});

const STAGE_DIAGNOSTICS_KEYS = Object.freeze({
    [VIDEO_STAGES.FACEMESH]: [
        "ear_mean",
        "blink_rate_per_min",
        "landmark_jitter",
        "lip_nose_coupling",
        "anomaly_score",
        "landmark_map_url",
    ],
    [VIDEO_STAGES.RPPG]: [
        "bpm_estimate",
        "signal_quality",
        "spatial_coherence",
        "is_biological",
        "ppg_map_url",
    ],
    [VIDEO_STAGES.FUSION]: [
        "verdict_reason",
        "stage_health",
        "is_biological",
        "optional_weights_summary",
    ],
});

function parsePositiveInt(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return fallback;
    }
    return parsed;
}

function parseNonNegativeInt(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed < 0) {
        return fallback;
    }
    return parsed;
}

function isVideoPipelineV2Enabled() {
    return String(process.env.VIDEO_PIPELINE_V2 || "false").toLowerCase() === "true";
}

function includeVideoStageDetails() {
    return String(process.env.VIDEO_INCLUDE_STAGE_DETAILS || "false").toLowerCase() === "true";
}

function getStageTimeoutMs() {
    return parsePositiveInt(process.env.VIDEO_STAGE_TIMEOUT_MS, 12000);
}

function getStageMaxRetries() {
    return parseNonNegativeInt(process.env.VIDEO_STAGE_MAX_RETRIES, 1);
}

function nowMs() {
    return Date.now();
}

function sanitizeShortString(value, maxLength = 180) {
    if (typeof value !== "string") return null;
    return value.slice(0, maxLength);
}

function sanitizeScalar(value) {
    if (value === null || value === undefined) return null;
    if (typeof value === "number" && Number.isFinite(value)) return Number(value.toFixed(6));
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return sanitizeShortString(value, 120);
    return null;
}

function sanitizeDiagnostics(stage, diagnostics) {
    const allowedKeys = STAGE_DIAGNOSTICS_KEYS[stage] || [];
    const safeSource = diagnostics && typeof diagnostics === "object" ? diagnostics : {};
    return allowedKeys.reduce((acc, key) => {
        const rawValue = safeSource[key];
        if (key === "stage_health") {
            if (typeof rawValue === "string") {
                acc[key] = sanitizeShortString(rawValue, 60);
            } else if (rawValue && typeof rawValue === "object") {
                const keys = Object.keys(rawValue).slice(0, 6);
                acc[key] = keys.join(",");
            } else {
                acc[key] = sanitizeScalar(rawValue);
            }
            return acc;
        }

        if (key === "optional_weights_summary") {
            if (typeof rawValue === "string") {
                acc[key] = sanitizeShortString(rawValue, 120);
            } else if (rawValue && typeof rawValue === "object") {
                const summary = Object.entries(rawValue)
                    .slice(0, 6)
                    .map(([weightName, weightValue]) => `${weightName}:${sanitizeScalar(weightValue) ?? "na"}`)
                    .join(",");
                acc[key] = sanitizeShortString(summary, 120);
            } else {
                acc[key] = sanitizeScalar(rawValue);
            }
            return acc;
        }

        acc[key] = sanitizeScalar(rawValue);
        return acc;
    }, {});
}

function clamp01(value) {
    if (!Number.isFinite(value)) return null;
    if (value < 0) return 0;
    if (value > 1) return 1;
    return Number(value.toFixed(6));
}

function safeLog(event, payload) {
    const safePayload = payload && typeof payload === "object" ? payload : {};
    console.info(`[video_pipeline] ${event}`, safePayload);
}

function isRetryableStageError(error) {
    if (!error || typeof error !== "object") return false;
    if (error.kind === "timeout") return true;
    if (error.kind === "network") return true;
    if (error.kind === "http" && Number.isInteger(error.status) && error.status >= 500) return true;
    return false;
}

function buildStageTransportError(stage, error, timeoutMs) {
    if (error?.code === "ECONNABORTED") {
        return {
            stage,
            code: "VIDEO_STAGE_TIMEOUT",
            detail: `${stage} stage timed out after ${timeoutMs}ms`,
            kind: "timeout",
        };
    }

    const status = error?.response?.status;
    if (Number.isInteger(status)) {
        const detailFromBody = sanitizeShortString(
            error?.response?.data?.error?.detail || error?.response?.data?.detail || error?.response?.statusText,
            140
        );
        return {
            stage,
            code: "VIDEO_STAGE_HTTP_ERROR",
            detail: detailFromBody || `${stage} stage returned HTTP ${status}`,
            status,
            kind: "http",
        };
    }

    return {
        stage,
        code: "VIDEO_STAGE_HTTP_ERROR",
        detail: sanitizeShortString(error?.message, 140) || `${stage} stage network error`,
        kind: "network",
    };
}

function validateStageResponseShape(stage, payload) {
    if (!payload || typeof payload !== "object") {
        return { ok: false, code: "VIDEO_PIPELINE_INVALID_RESPONSE", detail: `${stage} stage response is not an object` };
    }

    if (payload.stage !== stage) {
        return { ok: false, code: "VIDEO_PIPELINE_INVALID_RESPONSE", detail: `${stage} stage identifier mismatch` };
    }

    if (typeof payload.ok !== "boolean") {
        return { ok: false, code: "VIDEO_PIPELINE_INVALID_RESPONSE", detail: `${stage} stage missing boolean ok field` };
    }

    if (payload.ok === false) {
        const detail = sanitizeShortString(payload?.error?.detail, 160) || `${stage} stage reported failure`;
        return {
            ok: false,
            code: payload?.error?.code || STAGE_FAILURE_CODES[stage] || "VIDEO_PIPELINE_INVALID_RESPONSE",
            detail,
        };
    }

    if (payload.ok === true) {
        const score = payload.score;
        const confidence = payload.confidence;
        if (score !== null && score !== undefined && !Number.isFinite(Number(score))) {
            return { ok: false, code: "VIDEO_PIPELINE_INVALID_RESPONSE", detail: `${stage} stage score is invalid` };
        }
        if (confidence !== null && confidence !== undefined && !Number.isFinite(Number(confidence))) {
            return { ok: false, code: "VIDEO_PIPELINE_INVALID_RESPONSE", detail: `${stage} stage confidence is invalid` };
        }
    }

    if (stage === VIDEO_STAGES.FUSION && payload.ok === true) {
        if (!["real", "fake", "inconclusive"].includes(payload.verdict)) {
            return { ok: false, code: "VIDEO_PIPELINE_INVALID_RESPONSE", detail: "fusion verdict must be real/fake/inconclusive" };
        }
        if (!Number.isFinite(Number(payload.score)) || !Number.isFinite(Number(payload.confidence))) {
            return { ok: false, code: "VIDEO_PIPELINE_INVALID_RESPONSE", detail: "fusion score and confidence must be numeric" };
        }
    }

    return { ok: true };
}

async function callVideoStageWithRetry({ stage, payload, taskId }) {
    const maxAttempts = getStageMaxRetries() + 1;
    const timeoutMs = getStageTimeoutMs();
    const url = `${process.env.VIDEO_MODEL_URL}/predict/video/${stage}`;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        const startedAt = nowMs();
        try {
            const response = await axios.post(url, payload, { timeout: timeoutMs });
            const latencyMs = nowMs() - startedAt;

            const validation = validateStageResponseShape(stage, response.data);
            if (!validation.ok) {
                const invalidResponseError = {
                    stage,
                    code: validation.code,
                    detail: validation.detail,
                    kind: "invalid-response",
                };
                safeLog("stage_failure", {
                    task_id: taskId,
                    stage,
                    latency_ms: latencyMs,
                    attempt,
                    failure_reason: invalidResponseError.detail,
                });
                throw invalidResponseError;
            }

            safeLog("stage_success", {
                task_id: taskId,
                stage,
                latency_ms: latencyMs,
                attempt,
            });

            return {
                data: response.data,
                attempt,
                latencyMs,
            };
        } catch (error) {
            const latencyMs = nowMs() - startedAt;
            const stageError = error?.code && error?.detail ? error : buildStageTransportError(stage, error, timeoutMs);
            safeLog("stage_failure", {
                task_id: taskId,
                stage,
                latency_ms: latencyMs,
                attempt,
                failure_reason: stageError.detail,
            });

            if (attempt < maxAttempts && isRetryableStageError(stageError)) {
                continue;
            }

            throw stageError;
        }
    }

    throw {
        stage,
        code: "VIDEO_STAGE_HTTP_ERROR",
        detail: `${stage} stage failed after retry exhaustion`,
        kind: "network",
    };
}

function buildStageDetails(detailsByStage) {
    if (!includeVideoStageDetails()) return undefined;
    return detailsByStage;
}

function mapGeometryResult(facemeshStage) {
    const diagnostics = sanitizeDiagnostics(VIDEO_STAGES.FACEMESH, facemeshStage?.diagnostics);
    return createGeometryResult({
        ear_mean: diagnostics.ear_mean,
        blink_rate_per_min: diagnostics.blink_rate_per_min,
        landmark_jitter: diagnostics.landmark_jitter,
        lip_nose_coupling: diagnostics.lip_nose_coupling,
        anomaly_score: diagnostics.anomaly_score,
        confidence: clamp01(Number(facemeshStage?.confidence)),
        landmark_map_url: diagnostics.landmark_map_url,
        failure_reason: null,
    });
}

function mapRppgResult(rppgStage) {
    const diagnostics = sanitizeDiagnostics(VIDEO_STAGES.RPPG, rppgStage?.diagnostics);
    return createRPPGResult({
        bpm_estimate: diagnostics.bpm_estimate,
        signal_quality: diagnostics.signal_quality,
        spatial_coherence: diagnostics.spatial_coherence,
        is_biological: diagnostics.is_biological,
        confidence: clamp01(Number(rppgStage?.confidence)),
        ppg_map_url: diagnostics.ppg_map_url,
        failure_reason: null,
    });
}

function buildFailedVideoResult({
    taskId,
    errorCode,
    errorDetail,
    processingMs,
    geometryResult,
    rppgResult,
    analysis,
    stageDetails,
}) {
    const analysisContract = createAnalysisResult({
        taskId,
        status: AnalysisStatus.FAILED,
        mediaType: MediaType.VIDEO,
        verdict: null,
        confidence: null,
        processingMs,
        rppgResult: rppgResult || createRPPGResult(),
        geometryResult: geometryResult || createGeometryResult(),
        errorCode,
        errorDetail,
    });

    return {
        verdict: analysisContract.verdict,
        confidence: analysisContract.confidence,
        prediction: null,
        type: MediaType.VIDEO,
        rppg_result: analysisContract.rppg_result,
        geometry_result: analysisContract.geometry_result,
        analysis: analysis || null,
        status: analysisContract.status,
        error_code: analysisContract.error_code,
        error_detail: analysisContract.error_detail,
        stage_details: stageDetails,
    };
}

function getStudentVerdict(score, confidence, isBiological) {
    /**
     * Student-grade verdict logic for 80-85% accuracy models.
     * Adjusts thresholds to match realistic model performance,
     * avoiding excessive "inconclusive" verdicts.
     */
    const FAKE_THRESHOLD = 0.52;
    const REAL_THRESHOLD = 0.48;
    const MIN_CONF = 0.35;

    // Too uncertain - always inconclusive
    if (confidence < MIN_CONF) {
        return "inconclusive";
    }

    // Clear decision zones
    if (score >= FAKE_THRESHOLD) {
        return "fake";
    }
    if (score <= REAL_THRESHOLD) {
        return "real";
    }

    // Near boundary (0.48-0.52) - use tiebreaker
    if (confidence >= 0.50) {
        return isBiological ? "real" : "fake";
    }

    // Low confidence near boundary
    return "inconclusive";
}

function buildSuccessVideoResult({ taskId, fusionStage, geometryResult, rppgResult, processingMs, stageDetails }) {
    const fusionDiagnostics = sanitizeDiagnostics(VIDEO_STAGES.FUSION, fusionStage?.diagnostics);
    const score = clamp01(Number(fusionStage?.score));
    const confidence = clamp01(Number(fusionStage?.confidence));

    // Get biological signal indicator from rPPG diagnostics
    const isBiological = Boolean(fusionDiagnostics.is_biological || false);

    // ===== STUDENT-GRADE VERDICT ASSIGNMENT =====
    const verdict = getStudentVerdict(score, confidence, isBiological);
    // ===== END VERDICT ASSIGNMENT =====

    const analysisContract = createAnalysisResult({
        taskId,
        status: AnalysisStatus.COMPLETED,
        mediaType: MediaType.VIDEO,
        verdict,
        confidence,
        processingMs,
        rppgResult,
        geometryResult,
        errorCode: null,
        errorDetail: null,
    });

    return {
        verdict: analysisContract.verdict,
        confidence: analysisContract.confidence,
        prediction: score,
        type: MediaType.VIDEO,
        rppg_result: analysisContract.rppg_result,
        geometry_result: analysisContract.geometry_result,
        analysis: fusionDiagnostics,
        status: analysisContract.status,
        error_code: null,
        error_detail: null,
        stage_details: stageDetails,
    };
}

function mapLegacyVideoFallbackResult(taskId, payload, processingMs) {
    const safePayload = payload && typeof payload === "object" ? payload : {};
    const geometryResult = createGeometryResult(safePayload.geometry_result || {});
    const rppgResult = createRPPGResult(safePayload.rppg_result || {});
    const confidence = Number.isFinite(Number(safePayload.confidence)) ? Number(safePayload.confidence) : null;

    // Apply student-grade verdict logic
    const fallbackScore = Number.isFinite(Number(safePayload.prediction)) ? Number(safePayload.prediction) : 0.5;
    const fallbackConfidence = confidence === null ? 0.35 : confidence;
    const fallbackIsBiological = Boolean(safePayload.rppg_result?.is_biological || false);
    const studentVerdict = !safePayload.error ? getStudentVerdict(fallbackScore, fallbackConfidence, fallbackIsBiological) : null;

    const analysisContract = createAnalysisResult({
        taskId,
        status: safePayload.error ? AnalysisStatus.FAILED : AnalysisStatus.COMPLETED,
        mediaType: MediaType.VIDEO,
        verdict: studentVerdict,
        confidence: confidence === null ? null : clamp01(confidence),
        processingMs,
        rppgResult,
        geometryResult,
        errorCode: safePayload.error ? "VIDEO_FALLBACK_ERROR" : null,
        errorDetail: safePayload.error ? sanitizeShortString(String(safePayload.error), 160) : null,
    });

    const analysis = sanitizeDiagnostics(VIDEO_STAGES.FUSION, safePayload.analysis || {});

    return {
        verdict: analysisContract.verdict,
        confidence: analysisContract.confidence,
        prediction: Number.isFinite(Number(safePayload.prediction)) ? clamp01(Number(safePayload.prediction)) : null,
        type: MediaType.VIDEO,
        rppg_result: analysisContract.rppg_result,
        geometry_result: analysisContract.geometry_result,
        analysis,
        status: analysisContract.status,
        error_code: analysisContract.error_code,
        error_detail: analysisContract.error_detail,
        stage_details: buildStageDetails({ fallback: { ok: !safePayload.error } }),
    };
}

async function runVideoPipelineV2(fileUrl, taskId) {
    const pipelineStartedAt = nowMs();
    const stageState = {
        facemesh: { success: false },
        rppg: { success: false },
        fusion: { success: false },
    };

    let facemeshStage;
    let rppgStage;

    try {
        const facemesh = await callVideoStageWithRetry({
            stage: VIDEO_STAGES.FACEMESH,
            payload: { file_url: fileUrl, task_id: taskId },
            taskId,
        });
        facemeshStage = facemesh.data;
        stageState.facemesh = { success: true, latency_ms: facemesh.latencyMs, attempts: facemesh.attempt };

        const rppg = await callVideoStageWithRetry({
            stage: VIDEO_STAGES.RPPG,
            payload: { file_url: fileUrl, task_id: taskId },
            taskId,
        });
        rppgStage = rppg.data;
        stageState.rppg = { success: true, latency_ms: rppg.latencyMs, attempts: rppg.attempt };

        const fusion = await callVideoStageWithRetry({
            stage: VIDEO_STAGES.FUSION,
            payload: {
                file_url: fileUrl,
                task_id: taskId,
                stage_inputs: {
                    [VIDEO_STAGES.FACEMESH]: facemeshStage,
                    [VIDEO_STAGES.RPPG]: rppgStage,
                },
            },
            taskId,
        });
        stageState.fusion = { success: true, latency_ms: fusion.latencyMs, attempts: fusion.attempt };

        const processingMs = nowMs() - pipelineStartedAt;
        const geometryResult = mapGeometryResult(facemeshStage);
        const rppgResult = mapRppgResult(rppgStage);
        const stageDetails = buildStageDetails(stageState);

        const successResult = buildSuccessVideoResult({
            taskId,
            fusionStage: fusion.data,
            geometryResult,
            rppgResult,
            processingMs,
            stageDetails,
        });

        safeLog("pipeline_summary", {
            task_id: taskId,
            final_status: successResult.status,
            total_latency_ms: processingMs,
            stage_map: {
                facemesh: stageState.facemesh.success,
                rppg: stageState.rppg.success,
                fusion: stageState.fusion.success,
            },
        });

        return successResult;
    } catch (stageError) {
        const failedStage = stageError?.stage;
        if (failedStage && stageState[failedStage]) {
            stageState[failedStage].success = false;
        }

        const processingMs = nowMs() - pipelineStartedAt;
        const geometryResult = facemeshStage ? mapGeometryResult(facemeshStage) : createGeometryResult();
        const rppgResult = rppgStage ? mapRppgResult(rppgStage) : createRPPGResult();
        const failedCode = stageError?.code === "VIDEO_PIPELINE_INVALID_RESPONSE"
            ? "VIDEO_PIPELINE_INVALID_RESPONSE"
            : STAGE_FAILURE_CODES[failedStage] || "VIDEO_PIPELINE_INVALID_RESPONSE";
        const errorDetail = sanitizeShortString(
            `${stageError?.code || "VIDEO_PIPELINE_INVALID_RESPONSE"}: ${stageError?.detail || "Video stage execution failed"}`,
            180
        );

        const failedResult = buildFailedVideoResult({
            taskId,
            errorCode: failedCode,
            errorDetail,
            processingMs,
            geometryResult,
            rppgResult,
            analysis: null,
            stageDetails: buildStageDetails(stageState),
        });

        safeLog("pipeline_summary", {
            task_id: taskId,
            final_status: failedResult.status,
            total_latency_ms: processingMs,
            stage_map: {
                facemesh: stageState.facemesh.success,
                rppg: stageState.rppg.success,
                fusion: stageState.fusion.success,
            },
        });

        return failedResult;
    }
}

async function runVideoFallback(fileUrl, taskId) {
    const startedAt = nowMs();
    const response = await axios.post(
        `${process.env.VIDEO_MODEL_URL}/predict/video`,
        { file_url: fileUrl, task_id: taskId },
        { timeout: getStageTimeoutMs() }
    );
    return mapLegacyVideoFallbackResult(taskId, response.data, nowMs() - startedAt);
}

// Map mimeType prefix to the correct model API URL
const getModelUrl = (mimeType) => {
    if (mimeType.startsWith("image/")) {
        return `${process.env.IMAGE_MODEL_URL}/predict/image`;
    }
    if (mimeType.startsWith("audio/")) {
        return `${process.env.AUDIO_MODEL_URL}/predict/audio`;
    }
    return null;
};

const getPrediction = async (mimeType, fileUrl, options = {}) => {
    const taskId = options.taskId || null;

    if (mimeType.startsWith("video/")) {
        if (isVideoPipelineV2Enabled()) {
            return runVideoPipelineV2(fileUrl, taskId);
        }
        return runVideoFallback(fileUrl, taskId);
    }

    const modelUrl = getModelUrl(mimeType);

    if (!modelUrl) {
        throw new Error(`No model available for type: ${mimeType}`);
    }

    const payload = fileUrl ? { file_url: fileUrl } : {};
    const response = await axios.post(modelUrl, payload);
    return response.data; // { prediction, confidence, type }
};

module.exports = { getPrediction };
