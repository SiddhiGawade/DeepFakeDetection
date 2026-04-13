/**
 * uploadRoutes.js
 *
 * Route wiring for upload features.
 * Keeps endpoint registration clean and delegates behavior to controller/middleware.
 *
 * Owner: Team Lead (Ayush)
 * Version: 1.0.0
 *
 * Team review checklist:
 * - keep route names stable for frontend consumers
 * - ensure middleware errors are passed through handleUploadMiddlewareError
 * - if route signatures change, update docs/upload-validation-refactor.md
 */
const express = require("express");
const router = express.Router();
const upload = require("../utils/fileUpload");
const {
	uploadFile,
	getUploadConstraintsResponse,
	getUploadStatus,
	handleUploadMiddlewareError,
} = require("../controllers/uploadController");

router.get("/constraints", getUploadConstraintsResponse);
router.get("/status/:taskId", getUploadStatus);

// upload.single("file") means we expect ONE file with field name "file"
router.post(
	"/",
	(req, res, next) => {
		upload.single("file")(req, res, (error) => {
			if (error) {
				return handleUploadMiddlewareError(req, res, error);
			}
			return next();
		});
	},
	uploadFile
);

module.exports = router;
