# Upload Validation Refactor Documentation

Owner: Team Lead (Ayush)
Version: 1.0.0

Team checks before merge:

- verify backend error codes are mirrored in frontend uploadErrorMap
- verify media_type values remain exactly image/audio/video across client and server
- verify constraints endpoint and per-page hints still align after any future constraint edits
- verify docs links still point to valid lines after refactors

## Scope
This document captures the implementation of:

- backend as the authoritative validation layer
- canonical constraints centralized in backend
- media_type-driven upload contract
- structured error response model
- frontend as non-authoritative UX consumer of backend constraints
- consistent shared error mapping
- media-filtered file pickers for image/audio/video

## 1) Canonical Backend Source of Truth
The canonical contract and constraints are centralized here:

- Schema version: [SCHEMA_VERSION](../server/src/contracts/analyseContract.js#L3)
- Canonical media enum: [MediaType](../server/src/contracts/analyseContract.js#L5)
- Canonical constraints object: [FILE_CONSTRAINTS](../server/src/contracts/analyseContract.js#L24)
- FileConstraints alias export: [FileConstraints](../server/src/contracts/analyseContract.js#L69)
- Constraint accessor: [getConstraints(mediaType)](../server/src/contracts/analyseContract.js#L124)
- MIME gate helper: [isAllowedMime(mediaType, mimeType)](../server/src/contracts/analyseContract.js#L118)
- Max bytes helper: [maxBytes(mediaType)](../server/src/contracts/analyseContract.js#L107)
- Metadata validator: [validateUploadMetadata(rawMetadata)](../server/src/contracts/analyseContract.js#L146)

Analysis-shape compatibility helpers are also centralized:

- Analysis task builder: [createAnalysisTask](../server/src/contracts/analyseContract.js#L189)
- Final result builder: [createAnalysisResult](../server/src/contracts/analyseContract.js#L199)
- Error result builder: [createFailureAnalysisResult](../server/src/contracts/analyseContract.js#L230)

## 2) Backend Upload API and Validation Path
### Route wiring
Upload routes expose constraints/status and wrap multer middleware errors:

- Constraints endpoint: [GET /api/upload/constraints](../server/src/routes/uploadRoutes.js#L11)
- Status endpoint: [GET /api/upload/status/:taskId](../server/src/routes/uploadRoutes.js#L12)
- Upload endpoint wrapper: [POST /api/upload](../server/src/routes/uploadRoutes.js#L15)

### Controller responsibilities
Upload controller enforces backend-only validation:

- Constraints response handler: [getUploadConstraintsResponse](../server/src/controllers/uploadController.js#L131)
- Status placeholder handler: [getUploadStatus](../server/src/controllers/uploadController.js#L155)
- Multer error normalization: [handleUploadMiddlewareError](../server/src/controllers/uploadController.js#L170)
- Main upload flow: [uploadFile](../server/src/controllers/uploadController.js#L212)

Security-critical checks happen here:

- media_type check: [uploadFile media_type validation](../server/src/controllers/uploadController.js#L212)
- MIME check: [isAllowedMime gate](../server/src/controllers/uploadController.js#L252)
- File-size check: [per-media max byte enforcement](../server/src/controllers/uploadController.js#L265)
- Video duration/FPS check trigger: [video validation branch](../server/src/controllers/uploadController.js#L278)
- Video rules implementation: [validateVideoRules](../server/src/controllers/uploadController.js#L83)

Structured error code usage examples:

- FILE_TOO_LARGE in middleware path: [FILE_TOO_LARGE (middleware)](../server/src/controllers/uploadController.js#L185)
- INVALID_MIME_TYPE in middleware path: [INVALID_MIME_TYPE (middleware)](../server/src/controllers/uploadController.js#L196)
- INVALID_MIME_TYPE in authoritative upload check: [INVALID_MIME_TYPE (upload)](../server/src/controllers/uploadController.js#L258)
- FILE_TOO_LARGE in authoritative upload check: [FILE_TOO_LARGE (upload)](../server/src/controllers/uploadController.js#L272)
- VIDEO_TOO_SHORT: [VIDEO_TOO_SHORT](../server/src/controllers/uploadController.js#L106)
- VIDEO_FPS_TOO_LOW: [VIDEO_FPS_TOO_LOW](../server/src/controllers/uploadController.js#L122)

AnalysisResult compatibility fields in returned payload are preserved and normalized:

- schema_version: [schema_version normalization](../server/src/controllers/uploadController.js#L77)
- error_code: [error_code normalization](../server/src/controllers/uploadController.js#L78)
- error_detail: [error_detail normalization](../server/src/controllers/uploadController.js#L79)

## 3) Multer Boundary and Shared Acceptance Union
Multer now uses a backend-derived union while strict per-media enforcement stays in controller:

- Max upload upper bound: [MAX_UPLOAD_BYTES](../server/src/utils/fileUpload.js#L4)
- Allowed MIME union: [ALLOWED_MIME_UNION](../server/src/utils/fileUpload.js#L5)
- Union filter application: [fileFilter MIME check](../server/src/utils/fileUpload.js#L26)
- Multer limit: [limits.fileSize = MAX_UPLOAD_BYTES](../server/src/utils/fileUpload.js#L37)

## 4) Video Metadata Validation Support
Video duration/FPS probing utility:

- Probe entrypoint: [probeVideo(filePath)](../server/src/utils/videoMetadata.js#L37)
- Frame-rate parser: [parseFrameRate](../server/src/utils/videoMetadata.js#L10)
- Duration parser: [parseDuration](../server/src/utils/videoMetadata.js#L24)

Dependency registration:

- ffprobe-static dependency: [server/package.json](../server/package.json#L13)

## 5) Shared Frontend Constraints Consumer and Upload Client
Frontend no longer hardcodes canonical business constraints per page; it consumes backend hints:

- Shared API error class: [UploadApiError](../client/src/services/uploadApi.js#L33)
- Constraints fetch: [fetchUploadConstraints(mediaType)](../client/src/services/uploadApi.js#L63)
- Upload payload contract (file + media_type + optional metadata): [uploadMediaFile](../client/src/services/uploadApi.js#L81)
- UX hint derivation from backend payload: [getConstraintUiHints](../client/src/services/uploadApi.js#L105)

## 6) Shared Frontend Error Mapping
Consistent error messaging is centralized:

- Error map: [UPLOAD_ERROR_MAP](../client/src/constants/uploadErrorMap.js#L1)
- Mapper function: [getUploadErrorMessage](../client/src/constants/uploadErrorMap.js#L14)

## 7) Refactored Upload Pages (No Canonical Rule Duplication)
Each page now:

- identifies media type
- fetches constraints from backend
- uploads via shared client with media_type
- maps backend error_code via shared map
- uses media-only file picker filter for OS explorer

### Image upload page
- media type: [MEDIA_TYPE = image](../client/src/pages/ImageDetectionPage.jsx#L9)
- fetch constraints: [fetchUploadConstraints](../client/src/pages/ImageDetectionPage.jsx#L22)
- upload call: [uploadMediaFile](../client/src/pages/ImageDetectionPage.jsx#L52)
- shared error mapping: [getUploadErrorMessage](../client/src/pages/ImageDetectionPage.jsx#L61)
- hints from backend: [getConstraintUiHints](../client/src/pages/ImageDetectionPage.jsx#L69)
- picker filter: [accept = ${MEDIA_TYPE}/*](../client/src/pages/ImageDetectionPage.jsx#L111)

### Audio upload page
- media type: [MEDIA_TYPE = audio](../client/src/pages/AudioDetectionPage.jsx#L9)
- fetch constraints: [fetchUploadConstraints](../client/src/pages/AudioDetectionPage.jsx#L22)
- upload call: [uploadMediaFile](../client/src/pages/AudioDetectionPage.jsx#L52)
- shared error mapping: [getUploadErrorMessage](../client/src/pages/AudioDetectionPage.jsx#L61)
- hints from backend: [getConstraintUiHints](../client/src/pages/AudioDetectionPage.jsx#L69)
- picker filter: [accept = ${MEDIA_TYPE}/*](../client/src/pages/AudioDetectionPage.jsx#L108)

### Video upload page
- media type: [MEDIA_TYPE = video](../client/src/pages/VideoDetectionPage.jsx#L9)
- fetch constraints: [fetchUploadConstraints](../client/src/pages/VideoDetectionPage.jsx#L22)
- upload call: [uploadMediaFile](../client/src/pages/VideoDetectionPage.jsx#L52)
- shared error mapping: [getUploadErrorMessage](../client/src/pages/VideoDetectionPage.jsx#L61)
- hints from backend: [getConstraintUiHints](../client/src/pages/VideoDetectionPage.jsx#L69)
- picker filter: [accept = ${MEDIA_TYPE}/*](../client/src/pages/VideoDetectionPage.jsx#L108)

## 8) Notes on Enforcement Model
Final enforcement and rejection logic is backend-only.
Frontend filtering and hints are UX-only conveniences and not security controls.

That model is implemented by combining:

- canonical constraints in backend contract
- strict checks in upload controller
- shared frontend constraints display and consistent error rendering
- media-type picker filtering on upload inputs
