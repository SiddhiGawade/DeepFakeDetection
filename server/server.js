require("dotenv").config();
const express = require("express");
const uploadRoutes = require("./src/routes/uploadRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

const connectDB = require("./src/config/db");
connectDB();

// Parse incoming JSON bodies
app.use(express.json());
app.use("/api/upload", uploadRoutes);

// Health check — confirms server is alive
app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Deepfake Detection API is running" });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
