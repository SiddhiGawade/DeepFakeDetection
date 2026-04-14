/**
 * fileUpload.js
 *
 * Multer storage and broad MIME boundary checks.
 * Per-media strict enforcement happens later in uploadController with media_type context.
 *
 * Owner: Team Lead (Ayush)
 * Version: 1.0.0
 *
 * Team review checklist:
 * - keep this layer permissive enough for all supported media families
 * - keep strict business rules in controller, not here
 * - verify max upload cap stays aligned with contract constraints
 */
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { MediaType, getConstraints, maxBytes } = require("../contracts/analyseContract");

const MAX_UPLOAD_BYTES = Math.max(...Object.values(MediaType).map((mediaType) => maxBytes(mediaType) || 0));
const ALLOWED_MIME_UNION = [...new Set(
    Object.values(MediaType).flatMap((mediaType) => getConstraints(mediaType)?.allowedMimes || [])
)];

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// diskStorage tells multer WHERE and HOW to save files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // save to absolute uploads/ folder
    },
    filename: function (req, file, cb) {
        // give file a unique name: timestamp + original name
        // e.g. 1712000000000-myvideo.mp4
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    },
});

// fileFilter decides which file types are allowed
const fileFilter = (req, file, cb) => {
    const mimeType = String(file.mimetype || "").toLowerCase();

    if (ALLOWED_MIME_UNION.includes(mimeType)) {
        cb(null, true); // accept file
    } else {
        cb(new Error("Unsupported file type"), false); // reject file
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    // The strict per-media limit is enforced in the controller using media_type.
    limits: { fileSize: MAX_UPLOAD_BYTES },
});

module.exports = upload;
