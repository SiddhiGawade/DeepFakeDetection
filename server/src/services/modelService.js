const axios = require("axios");

// Map mimeType prefix to the correct model API URL
const getModelUrl = (mimeType) => {
    if (mimeType.startsWith("image/")) {
        return `${process.env.IMAGE_MODEL_URL}/predict/image`;
    }
    if (mimeType.startsWith("video/")) {
        return `${process.env.VIDEO_MODEL_URL}/predict/video`;
    }
    if (mimeType.startsWith("audio/")) {
        return `${process.env.AUDIO_MODEL_URL}/predict/audio`;
    }
    return null;
};

const getPrediction = async (mimeType) => {
    const modelUrl = getModelUrl(mimeType);

    if (!modelUrl) {
        throw new Error(`No model available for type: ${mimeType}`);
    }

    const response = await axios.post(modelUrl);
    return response.data; // { prediction, confidence, type }
};

module.exports = { getPrediction };
