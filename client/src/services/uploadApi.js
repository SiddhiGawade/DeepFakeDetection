/**
 * uploadApi.js
 *
 * Shared upload client for all detection pages.
 * Centralizes constraints fetch, upload POST, and response error normalization.
 *
 * Owner: Team Lead (Ayush)
 * Version: 1.0.0
 *
 * Team review checklist:
 * - keep media_type normalization consistent with backend contract
 * - if backend error payload shape changes, update UploadApiError mapping here first
 * - avoid page-level ad-hoc fetch logic; route through this module
 */
const constraintsCache = new Map();

const MEDIA_LABEL_OVERRIDES = {
    "audio/mpeg": "MP3",
    "audio/mp4": "M4A",
    "audio/wav": "WAV",
    "audio/x-wav": "WAV",
    "audio/ogg": "OGG",
    "audio/webm": "WEBM",
    "video/mp4": "MP4",
    "video/webm": "WEBM",
    "video/quicktime": "MOV",
    "video/x-msvideo": "AVI",
    "video/x-matroska": "MKV",
    "video/3gpp": "3GPP",
    "image/jpeg": "JPEG",
    "image/jpg": "JPG",
    "image/png": "PNG",
    "image/webp": "WEBP",
    "image/bmp": "BMP",
    "image/heic": "HEIC",
};

function toFriendlyMimeLabel(mimeType) {
    if (MEDIA_LABEL_OVERRIDES[mimeType]) {
        return MEDIA_LABEL_OVERRIDES[mimeType];
    }

    const [, subtype = "FILE"] = String(mimeType).split("/");
    return subtype.toUpperCase();
}

export class UploadApiError extends Error {
    constructor(message, { status = null, code = null, detail = null, payload = null } = {}) {
        super(message);
        this.name = "UploadApiError";
        this.status = status;
        this.code = code;
        this.detail = detail;
        this.payload = payload;
    }
}

async function readJson(response) {
    try {
        return await response.json();
    } catch {
        return null;
    }
}

function ensureSuccessResponse(response, payload) {
    if (response.ok && payload?.success) return;

    throw new UploadApiError(payload?.message || "Request failed", {
        status: response.status,
        code: payload?.data?.error_code || null,
        detail: payload?.data?.error_detail || null,
        payload,
    });
}

export async function fetchUploadConstraints(mediaType) {
    const normalizedMediaType = String(mediaType || "").trim().toLowerCase();
    if (!normalizedMediaType) {
        throw new UploadApiError("mediaType is required to fetch constraints");
    }

    if (constraintsCache.has(normalizedMediaType)) {
        return constraintsCache.get(normalizedMediaType);
    }

    const response = await fetch(`/api/upload/constraints?media_type=${encodeURIComponent(normalizedMediaType)}`);
    const payload = await readJson(response);
    ensureSuccessResponse(response, payload);

    constraintsCache.set(normalizedMediaType, payload.data);
    return payload.data;
}

export async function uploadMediaFile({ file, mediaType, metadata }) {
    const normalizedMediaType = String(mediaType || "").trim().toLowerCase();
    if (!file) throw new UploadApiError("file is required");
    if (!normalizedMediaType) throw new UploadApiError("mediaType is required");

    const formData = new FormData();
    formData.append("media_type", normalizedMediaType);

    if (metadata && Object.keys(metadata).length > 0) {
        formData.append("metadata", JSON.stringify(metadata));
    }

    formData.append("file", file);

    const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
    });

    const payload = await readJson(response);
    ensureSuccessResponse(response, payload);
    return payload;
}

export function getConstraintUiHints(constraints) {
    if (!constraints) {
        return {
            acceptValue: undefined,
            mediaHintLabel: "Formats from server",
            maxSizeLabel: "server-defined limit",
        };
    }

    const labels = [...new Set((constraints.allowedMimes || []).map(toFriendlyMimeLabel))];
    return {
        acceptValue: (constraints.allowedMimes || []).join(","),
        mediaHintLabel: labels.join(", "),
        maxSizeLabel: `${constraints.maxMb}MB`,
    };
}
