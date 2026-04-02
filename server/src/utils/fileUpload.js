const multer = require("multer");
const path = require("path");

// diskStorage tells multer WHERE and HOW to save files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // save to uploads/ folder
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
    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "video/mp4",
        "video/webm",
        "audio/mpeg",
        "audio/wav",
        "audio/mp4",
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); // accept file
    } else {
        cb(new Error("Unsupported file type"), false); // reject file
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 200 * 1024 * 1024 }, // 200MB max
});

module.exports = upload;
