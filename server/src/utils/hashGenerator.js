const crypto = require("crypto");
const fs = require("fs");

/**
 * Generates a SHA-256 hash from a file on disk.
 * Same file content will always produce the same hash.
 * Even 1 byte difference = completely different hash.
 *
 * @param {string} filePath - path to the file e.g. "uploads/123-video.mp4"
 * @returns {string} - hex hash string e.g. "a3f9c2..."
 */
const generateFileHash = (filePath) => {
    const fileBuffer = fs.readFileSync(filePath); // read file as raw bytes
    const hash = crypto.createHash("sha256");     // create SHA-256 hasher
    hash.update(fileBuffer);                      // feed file bytes into it
    return hash.digest("hex");                    // get result as hex string
};

module.exports = { generateFileHash };
