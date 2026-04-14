const redis = require("../config/redis");

// How long to keep results cached (in seconds)
// 86400 = 24 hours
const CACHE_TTL = 86400;

/**
 * Check if a result exists in cache for this hash
 * Returns parsed object if found, null if not
 */
const getCachedResult = async (fileHash) => {
    try {
        const cached = await redis.get(fileHash);
        return cached ? JSON.parse(cached) : null;
    } catch {
        return null;
    }
};

/**
 * Store a result in cache against this hash
 * Automatically expires after CACHE_TTL seconds
 */
const setCachedResult = async (fileHash, result) => {
    try {
        await redis.set(fileHash, JSON.stringify(result), "EX", CACHE_TTL);
    } catch {
        // Ignore cache write errors if Redis is down
    }
};

module.exports = { getCachedResult, setCachedResult };
