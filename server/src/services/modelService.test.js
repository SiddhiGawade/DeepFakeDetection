const axios = require("axios");

jest.mock("axios");

const { getPrediction } = require("./modelService");

function makeStagePayload(stage, data = {}) {
    return {
        ok: true,
        stage,
        score: 0.5,
        confidence: 0.7,
        diagnostics: {},
        error: null,
        model_version: "test-v1",
        latency_ms: 10,
        ...data,
    };
}

describe("modelService video pipeline", () => {
    beforeEach(() => {
        jest.resetAllMocks();
        process.env.VIDEO_MODEL_URL = "http://video-model";
        process.env.IMAGE_MODEL_URL = "http://image-model";
        process.env.AUDIO_MODEL_URL = "http://audio-model";
        process.env.VIDEO_PIPELINE_V2 = "true";
        process.env.VIDEO_STAGE_TIMEOUT_MS = "500";
        process.env.VIDEO_STAGE_MAX_RETRIES = "0";
        process.env.VIDEO_INCLUDE_STAGE_DETAILS = "true";
        jest.spyOn(console, "info").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("runs facemesh -> rppg -> fusion happy path", async () => {
        axios.post
            .mockResolvedValueOnce({
                data: makeStagePayload("facemesh", {
                    score: 0.34,
                    confidence: 0.75,
                    diagnostics: {
                        ear_mean: 0.22,
                        blink_rate_per_min: 18,
                        landmark_jitter: 0.08,
                        lip_nose_coupling: 0.72,
                        anomaly_score: 0.26,
                        landmark_map_url: "https://example/landmarks",
                    },
                }),
            })
            .mockResolvedValueOnce({
                data: makeStagePayload("rppg", {
                    score: 0.31,
                    confidence: 0.68,
                    diagnostics: {
                        bpm_estimate: 78,
                        signal_quality: 0.81,
                        spatial_coherence: 0.79,
                        is_biological: true,
                        ppg_map_url: "https://example/ppg",
                    },
                }),
            })
            .mockResolvedValueOnce({
                data: makeStagePayload("fusion", {
                    score: 0.72,
                    confidence: 0.9,
                    verdict: "fake",
                    diagnostics: {
                        verdict_reason: "High synthetic signature",
                        stage_health: "ok",
                        optional_weights_summary: "geo=0.2,rppg=0.8",
                    },
                }),
            });

        const result = await getPrediction("video/mp4", "https://files/video.mp4", { taskId: "task-happy" });

        expect(result.type).toBe("video");
        expect(result.status).toBe("completed");
        expect(result.verdict).toBe("fake");
        expect(result.prediction).toBe(0.72);
        expect(result.geometry_result.ear_mean).toBe(0.22);
        expect(result.rppg_result.bpm_estimate).toBe(78);
        expect(result.analysis.verdict_reason).toBe("High synthetic signature");
        expect(result.stage_details.facemesh.success).toBe(true);
        expect(result.stage_details.rppg.success).toBe(true);
        expect(result.stage_details.fusion.success).toBe(true);

        expect(axios.post).toHaveBeenCalledTimes(3);
        expect(axios.post.mock.calls[0][0]).toBe("http://video-model/predict/video/facemesh");
        expect(axios.post.mock.calls[1][0]).toBe("http://video-model/predict/video/rppg");
        expect(axios.post.mock.calls[2][0]).toBe("http://video-model/predict/video/fusion");
    });

    test("returns structured failure when facemesh stage fails", async () => {
        axios.post.mockRejectedValue({ response: { status: 503, statusText: "Service Unavailable" } });

        const result = await getPrediction("video/mp4", "https://files/video.mp4", { taskId: "task-face-fail" });

        expect(result.status).toBe("failed");
        expect(result.error_code).toBe("VIDEO_FACEMESH_FAILED");
        expect(result.error_detail).toContain("VIDEO_STAGE_HTTP_ERROR");
    });

    test("returns structured failure when rppg stage fails", async () => {
        axios.post
            .mockResolvedValueOnce({ data: makeStagePayload("facemesh") })
            .mockRejectedValueOnce({
                response: {
                    status: 400,
                    data: { error: { detail: "invalid input" } },
                    statusText: "Bad Request",
                },
            });

        const result = await getPrediction("video/mp4", "https://files/video.mp4", { taskId: "task-rppg-fail" });

        expect(result.status).toBe("failed");
        expect(result.error_code).toBe("VIDEO_RPPG_FAILED");
        expect(result.error_detail).toContain("VIDEO_STAGE_HTTP_ERROR");
    });

    test("returns structured failure when fusion stage fails", async () => {
        axios.post
            .mockResolvedValueOnce({ data: makeStagePayload("facemesh") })
            .mockResolvedValueOnce({ data: makeStagePayload("rppg") })
            .mockRejectedValueOnce({ code: "ECONNABORTED", message: "timeout" });

        const result = await getPrediction("video/mp4", "https://files/video.mp4", { taskId: "task-fusion-fail" });

        expect(result.status).toBe("failed");
        expect(result.error_code).toBe("VIDEO_FUSION_FAILED");
        expect(result.error_detail).toContain("VIDEO_STAGE_TIMEOUT");
    });

    test("retries timeout until retry budget is exhausted", async () => {
        process.env.VIDEO_STAGE_MAX_RETRIES = "2";
        axios.post.mockRejectedValue({ code: "ECONNABORTED", message: "timed out" });

        const result = await getPrediction("video/mp4", "https://files/video.mp4", { taskId: "task-retry" });

        expect(result.status).toBe("failed");
        expect(result.error_code).toBe("VIDEO_FACEMESH_FAILED");
        expect(result.error_detail).toContain("VIDEO_STAGE_TIMEOUT");
        expect(axios.post).toHaveBeenCalledTimes(3);
    });
});

describe("modelService non-video behavior", () => {
    beforeEach(() => {
        jest.resetAllMocks();
        process.env.IMAGE_MODEL_URL = "http://image-model";
        process.env.AUDIO_MODEL_URL = "http://audio-model";
    });

    test("keeps image prediction path unchanged", async () => {
        axios.post.mockResolvedValueOnce({
            data: { prediction: 0.12, confidence: 92.1, type: "image", verdict: "Real" },
        });

        const result = await getPrediction("image/png", "https://files/image.png");

        expect(axios.post).toHaveBeenCalledWith("http://image-model/predict/image", { file_url: "https://files/image.png" });
        expect(result).toEqual({ prediction: 0.12, confidence: 92.1, type: "image", verdict: "Real" });
    });

    test("keeps audio prediction path unchanged", async () => {
        axios.post.mockResolvedValueOnce({
            data: { prediction: 0.44, confidence: 77.3, type: "audio", verdict: "AI Generated" },
        });

        const result = await getPrediction("audio/mpeg", "https://files/audio.mp3");

        expect(axios.post).toHaveBeenCalledWith("http://audio-model/predict/audio", { file_url: "https://files/audio.mp3" });
        expect(result).toEqual({ prediction: 0.44, confidence: 77.3, type: "audio", verdict: "AI Generated" });
    });

    test("maps geometry and rPPG metrics from legacy fallback stage details", async () => {
        process.env.VIDEO_MODEL_URL = "http://video-model";
        process.env.VIDEO_PIPELINE_V2 = "false";
        process.env.VIDEO_INCLUDE_STAGE_DETAILS = "true";

        axios.post.mockResolvedValueOnce({
            data: {
                prediction: 0.41,
                confidence: 0.79,
                type: "video",
                verdict: "real",
                analysis: {
                    verdict_reason: "Signals are biologically consistent",
                },
                stage_details: {
                    facemesh: {
                        ok: true,
                        confidence: 0.74,
                        diagnostics: {
                            ear_mean: 0.24,
                            blink_rate_per_min: 16,
                            landmark_jitter: 0.11,
                            lip_nose_coupling: 0.64,
                            anomaly_score: 0.28,
                        },
                    },
                    rppg: {
                        ok: true,
                        confidence: 0.69,
                        diagnostics: {
                            bpm_estimate: 76,
                            signal_quality: 0.8,
                            spatial_coherence: 0.77,
                            is_biological: true,
                        },
                    },
                    fusion: {
                        ok: true,
                        confidence: 0.79,
                    },
                },
            },
        });

        const result = await getPrediction("video/mp4", "https://files/video.mp4", { taskId: "task-legacy-details" });

        expect(result.geometry_result.ear_mean).toBe(0.24);
        expect(result.geometry_result.blink_rate_per_min).toBe(16);
        expect(result.rppg_result.bpm_estimate).toBe(76);
        expect(result.rppg_result.signal_quality).toBe(0.8);
        expect(result.rppg_result.is_biological).toBe(true);
        expect(result.stage_details.facemesh.success).toBe(true);
        expect(result.stage_details.rppg.success).toBe(true);
        expect(result.stage_details.fusion.success).toBe(true);
    });
});