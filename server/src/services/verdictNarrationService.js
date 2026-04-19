const axios = require("axios");

const DEFAULT_TIMEOUT_MS = 2000;
const DEFAULT_MODEL = "gemini-2.0-flash";

const VIDEO_VERDICT_PATTERN = Object.freeze({
    fakeThreshold: 0.52,
    realThreshold: 0.48,
    minConfidence: 0.35,
    tieBreakerConfidence: 0.5,
});

const UNSUPPORTED_WORDING = [
    /\bguarantee(d|s)?\b/i,
    /\b100%\b/i,
    /\bdefinitely\b/i,
    /\bcertain(ty)?\b/i,
    /\bperfect\b/i,
    /\balways\b/i,
    /\bnever\b/i,
];

function parseTimeoutMs() {
    const parsed = Number.parseInt(process.env.GEMINI_VERDICT_TIMEOUT_MS, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return DEFAULT_TIMEOUT_MS;
    }
    return parsed;
}

function clamp01(value) {
    if (!Number.isFinite(value)) return null;
    if (value < 0) return 0;
    if (value > 1) return 1;
    return Number(value.toFixed(6));
}

function normalizeUnitInterval(rawValue) {
    if (rawValue === null || rawValue === undefined) return null;
    const numeric = Number(rawValue);
    if (!Number.isFinite(numeric)) return null;
    if (numeric > 1) return clamp01(numeric / 100);
    return clamp01(numeric);
}

function resolveStudentVerdict({ verdict, fusionScore, confidence, isBiological }) {
    const normalizedVerdict = typeof verdict === "string" ? verdict.toLowerCase() : null;
    if (["real", "fake", "inconclusive"].includes(normalizedVerdict)) {
        return normalizedVerdict;
    }

    if (fusionScore === null || confidence === null || confidence < VIDEO_VERDICT_PATTERN.minConfidence) {
        return "inconclusive";
    }

    if (fusionScore >= VIDEO_VERDICT_PATTERN.fakeThreshold) {
        return "fake";
    }

    if (fusionScore <= VIDEO_VERDICT_PATTERN.realThreshold) {
        return "real";
    }

    if (confidence >= VIDEO_VERDICT_PATTERN.tieBreakerConfidence) {
        return isBiological ? "real" : "fake";
    }

    return "inconclusive";
}

function safeShortString(value, maxLength = 180) {
    if (typeof value !== "string") return null;
    const compact = value.replace(/\s+/g, " ").trim();
    if (!compact) return null;
    return compact.slice(0, maxLength);
}

function sanitizeStageHealth(value) {
    if (value === null || value === undefined) return "not_provided";

    if (typeof value === "string") {
        return safeShortString(value, 120) || "not_provided";
    }

    if (typeof value === "object") {
        const entries = Object.entries(value)
            .slice(0, 8)
            .map(([stage, status]) => `${String(stage)}:${String(status)}`);

        return entries.length > 0 ? entries.join(",") : "not_provided";
    }

    return "not_provided";
}

function buildPrompt(payload) {
    const input = {
        verdict: payload.verdict,
        confidence: payload.confidence,
        fusion_score: payload.fusion_score,
        is_biological: payload.is_biological,
        stage_health: payload.stage_health,
        verdict_reason: payload.verdict_reason,
    };

    return [
        "You are generating user-facing verdict text for a deepfake video detector.",
        "Input data is final and deterministic; do not change the verdict.",
        "Use only the provided fields. Do not infer missing data.",
        "Return strict JSON only in this schema:",
        '{"sentences":["sentence 1","sentence 2"]}',
        "Rules:",
        "- sentences must be an array with 2 or 3 short sentences",
        "- each sentence must be <= 140 characters",
        "- plain language for non-technical users",
        "- avoid absolute claims or guarantees",
        "- do not include markdown or extra keys",
        `Input: ${JSON.stringify(input)}`,
    ].join("\n");
}

function parseGeminiJsonResponse(rawText) {
    if (typeof rawText !== "string") return null;

    const direct = rawText.trim();
    const fenced = direct.match(/```json\s*([\s\S]*?)\s*```/i);
    const candidate = fenced ? fenced[1].trim() : direct;

    try {
        return JSON.parse(candidate);
    } catch {
        return null;
    }
}

function validateSentencesSchema(parsed) {
    if (!parsed || typeof parsed !== "object") return null;
    if (!Array.isArray(parsed.sentences)) return null;

    const cleaned = parsed.sentences
        .filter((item) => typeof item === "string")
        .map((item) => item.replace(/\s+/g, " ").trim())
        .filter(Boolean)
        .slice(0, 3);

    if (cleaned.length < 2 || cleaned.length > 3) return null;

    const allSafe = cleaned.every((sentence) => {
        if (sentence.length > 140) return false;
        if (UNSUPPORTED_WORDING.some((pattern) => pattern.test(sentence))) return false;
        return /^[a-zA-Z0-9 ,.%:;()'\-_/!?]+$/.test(sentence);
    });

    if (!allSafe) return null;

    return cleaned;
}

function buildFallbackNarrative(payload) {
    const confidencePct = payload.confidence === null ? "N/A" : `${(payload.confidence * 100).toFixed(1)}%`;
    const scoreText = payload.fusion_score === null ? "N/A" : payload.fusion_score.toFixed(3);

    const verdictLead = payload.verdict === "fake"
        ? "The video is flagged as AI Generated by the final model verdict."
        : payload.verdict === "real"
            ? "The video is marked as Authentic by the final model verdict."
            : "The result is Inconclusive by the final model verdict.";

    const confidenceLine = `Confidence is ${confidencePct} with fusion score ${scoreText}.`;
    const reasonLine = payload.verdict_reason
        ? `Model note: ${payload.verdict_reason}.`
        : "Model note: Signals are mixed across pipeline stages.";

    return {
        sentences: [verdictLead, confidenceLine, reasonLine],
        source: "template",
    };
}

function normalizeNarrationInput(resultPayload) {
    const fusionScore = normalizeUnitInterval(resultPayload?.prediction);
    const confidence = normalizeUnitInterval(resultPayload?.confidence);
    const isBiological = Boolean(resultPayload?.rppg_result?.is_biological ?? resultPayload?.analysis?.is_biological);
    const stageHealth = sanitizeStageHealth(resultPayload?.analysis?.stage_health ?? resultPayload?.stage_details);
    const verdictReason = safeShortString(resultPayload?.analysis?.verdict_reason, 180);

    const verdict = resolveStudentVerdict({
        verdict: resultPayload?.verdict,
        fusionScore,
        confidence,
        isBiological,
    });

    return {
        verdict,
        confidence,
        fusion_score: fusionScore,
        is_biological: isBiological,
        stage_health: stageHealth,
        verdict_reason: verdictReason || "not_provided",
    };
}

async function requestGeminiNarrative(payload) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return null;
    }

    const modelName = process.env.GEMINI_MODEL || DEFAULT_MODEL;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const body = {
        contents: [
            {
                role: "user",
                parts: [{ text: buildPrompt(payload) }],
            },
        ],
        generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 220,
            responseMimeType: "application/json",
        },
    };

    const response = await axios.post(url, body, {
        timeout: parseTimeoutMs(),
        headers: {
            "Content-Type": "application/json",
        },
    });

    const rawText = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = parseGeminiJsonResponse(rawText);
    const sentences = validateSentencesSchema(parsed);

    if (!sentences) return null;

    return {
        sentences,
        source: "gemini",
    };
}

async function buildVideoVerdictNarrative(resultPayload) {
    const normalizedInput = normalizeNarrationInput(resultPayload);

    try {
        const geminiNarrative = await requestGeminiNarrative(normalizedInput);
        if (geminiNarrative) {
            return {
                ...geminiNarrative,
                input: normalizedInput,
            };
        }
    } catch {
        // Fallback is returned below.
    }

    return {
        ...buildFallbackNarrative(normalizedInput),
        input: normalizedInput,
    };
}

module.exports = {
    buildVideoVerdictNarrative,
    normalizeNarrationInput,
};
