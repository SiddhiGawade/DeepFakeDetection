const cloudinary = require("../config/cloudinary");
const fs = require("fs");

/**
 * Uploads a file to Cloudinary and returns the secure URL.
 * After upload, deletes the local temp file from uploads/.
 *
 * @param {string} filePath - local path e.g. "uploads/123-video.mp4"
 * @param {string} mediaType - "image" | "video" | "audio"
 * @returns {string} - Cloudinary secure URL
 */
const uploadToCloud = async (filePath, mediaType) => {
    // If Cloudinary isn't configured in .env, gracefully fallback to local file URLs
    // This allows local AI testing without crashing the Node backend!
    if (!process.env.CLOUDINARY_API_KEY) {
        console.warn("Cloudinary API Key not found! Bypassing upload and returning local file:// URL.");
        const absolutePath = require("path").resolve(filePath);
        // Important: keep the local file on disk so the AI service can read it
        return "file:///" + absolutePath.replace(/\\/g, '/');
    }

    // Cloudinary resource type mapping
    const resourceType = mediaType === "audio" ? "video" : mediaType;
    // Note: Cloudinary uses "video" resource type for audio files too

    const result = await cloudinary.uploader.upload(filePath, {
        resource_type: resourceType,
        folder: "deepfake_uploads",
    });

    // Delete local temp file after successful upload
    fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete temp file:", err.message);
    });

    return result.secure_url;
};

module.exports = { uploadToCloud };
