require("dotenv").config();
const express = require("express");

const app = express();
const PORT = process.env.PORT || 5000;

// Parse incoming JSON bodies
app.use(express.json());

// Health check — confirms server is alive
app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Deepfake Detection API is running" });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
