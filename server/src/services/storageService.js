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
