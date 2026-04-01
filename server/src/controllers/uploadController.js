const uploadFile = (req, res) => {
    // multer already processed the file before this runs
    // req.file contains all file info if upload succeeded
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No file uploaded",
        });
    }

    // Send back basic file info for now
    // We'll add hash generation and AI calls in later phases
    return res.status(200).json({
        success: true,
        message: "File uploaded successfully",
        data: {
            originalName: req.file.originalname,
            savedAs: req.file.filename,
            size: req.file.size,
            mimeType: req.file.mimetype,
            path: req.file.path,
        },
    });
};

module.exports = { uploadFile };
