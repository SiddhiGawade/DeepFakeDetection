/**
 * uploadErrorMap.js
 *
 * Frontend display copy for backend upload error codes.
 * Keeps user-facing messaging consistent across image, audio, and video pages.
 *
 * Owner: Team Lead (Ayush)
 * Version: 1.0.0
 *
 * Team review checklist:
 * - every new backend error_code must be mapped here
 * - keep language action-oriented and non-technical for end users
 * - fallback messaging should remain safe and generic
 */
const UPLOAD_ERROR_MAP = {
    INVALID_MEDIA_TYPE: "Invalid upload type selected. Please retry from the correct detection page.",
    INVALID_MIME_TYPE: "This file format is not supported for this detection type.",
    FILE_TOO_LARGE: "File size exceeds the allowed limit for this media type.",
    VIDEO_TOO_SHORT: "Video is too short for analysis. Please upload a longer clip.",
    VIDEO_TOO_LONG: "Video is too long for analysis. Please trim and retry.",
    VIDEO_FPS_TOO_LOW: "Video FPS is too low for reliable analysis.",
    INVALID_METADATA: "Upload metadata is invalid. Please retry.",
    VIDEO_METADATA_UNAVAILABLE: "Could not verify video properties. Please use another file.",
    NO_FILE_UPLOADED: "No file was received. Please select a file and try again.",
    UPLOAD_VALIDATION_FAILED: "Upload failed validation on the server.",
};

export function getUploadErrorMessage(errorCode, fallbackMessage) {
    if (errorCode && UPLOAD_ERROR_MAP[errorCode]) {
        return UPLOAD_ERROR_MAP[errorCode];
    }

    if (fallbackMessage) {
        return fallbackMessage;
    }

    return "Upload failed. Please try again.";
}
