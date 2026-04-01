const express = require("express");
const router = express.Router();
const upload = require("../utils/fileUpload");
const { uploadFile } = require("../controllers/uploadController");

// upload.single("file") means we expect ONE file with field name "file"
router.post("/", upload.single("file"), uploadFile);

module.exports = router;
