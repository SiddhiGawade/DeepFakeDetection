server/
├── src/
│   ├── config/          ← DB, Redis, S3 connection configs
│   ├── controllers/     ← Business logic (upload, predict, results)
│   ├── middleware/      ← File validation, error handling, auth (later)
│   ├── routes/          ← API route definitions
│   ├── services/        ← Redis cache, S3, AI model API calls
│   ├── models/          ← MongoDB schemas
│   └── utils/           ← Hash generation, file type detection, helpers
├── uploads/             ← Temp local storage before S3
├── .env.example
├── .gitignore
├── package.json
└── server.js            ← Entry point
