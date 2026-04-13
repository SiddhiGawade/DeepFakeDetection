/**
 * videoMetadata.js
 *
 * Lightweight ffprobe wrapper used during upload-time video validation.
 * Extracts duration and fps without binding this module to model inference logic.
 *
 * Owner: Team Lead (Ayush)
 * Version: 1.0.0
 *
 * Team review checklist:
 * - if ffprobe dependency changes, retest VIDEO_METADATA_UNAVAILABLE behavior
 * - keep parser functions tolerant to malformed probe output
 * - do not add heavy analysis logic in this utility
 */
const { execFile } = require("child_process");

let ffprobePath = null;
try {
    ffprobePath = require("ffprobe-static").path;
} catch (error) {
    ffprobePath = null;
}

function parseFrameRate(frameRate) {
    if (!frameRate || typeof frameRate !== "string") return null;

    const [numeratorRaw, denominatorRaw] = frameRate.split("/");
    const numerator = Number(numeratorRaw);
    const denominator = Number(denominatorRaw);

    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
        return null;
    }

    return numerator / denominator;
}

function parseDuration(videoStream, formatData) {
    const candidates = [videoStream?.duration, formatData?.duration];

    for (const candidate of candidates) {
        const numeric = Number(candidate);
        if (Number.isFinite(numeric) && numeric >= 0) {
            return numeric;
        }
    }

    return null;
}

function probeVideo(filePath) {
    return new Promise((resolve, reject) => {
        if (!ffprobePath) {
            const error = new Error("ffprobe-static is not available");
            error.code = "FFPROBE_UNAVAILABLE";
            reject(error);
            return;
        }

        execFile(
            ffprobePath,
            [
                "-v",
                "error",
                "-print_format",
                "json",
                "-show_streams",
                "-show_format",
                filePath,
            ],
            { windowsHide: true },
            (error, stdout) => {
                if (error) {
                    error.code = error.code || "FFPROBE_EXEC_FAILED";
                    reject(error);
                    return;
                }

                try {
                    const parsed = JSON.parse(stdout || "{}");
                    const streams = Array.isArray(parsed.streams) ? parsed.streams : [];
                    const videoStream = streams.find((stream) => stream.codec_type === "video");

                    if (!videoStream) {
                        const streamError = new Error("No video stream found");
                        streamError.code = "VIDEO_STREAM_NOT_FOUND";
                        reject(streamError);
                        return;
                    }

                    const durationSeconds = parseDuration(videoStream, parsed.format || {});
                    const fps = parseFrameRate(videoStream.avg_frame_rate) || parseFrameRate(videoStream.r_frame_rate);

                    resolve({ durationSeconds, fps });
                } catch (parseError) {
                    parseError.code = "FFPROBE_PARSE_FAILED";
                    reject(parseError);
                }
            }
        );
    });
}

module.exports = {
    probeVideo,
};
