const axios = require('axios');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY; // Set this in your env
const YOUTUBE_VIDEO_API = 'https://www.googleapis.com/youtube/v3/videos';

function extractVideoId(url) {
  const regex = /(?:v=|\/)([0-9A-Za-z_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

async function validate(content) {
  const errors = [];
  if (!content) {
    errors.push("YouTube video URL is required in content.");
    return { isValid: false, errors };
  }

  const videoId = extractVideoId(content);

  if (!videoId) {
    errors.push("Invalid YouTube URL format.");
    return { isValid: false, errors };
  }

  try {
    const response = await axios.get(YOUTUBE_VIDEO_API, {
      params: {
        id: videoId,
        key: YOUTUBE_API_KEY,
        part: 'status'
      }
    });
    const videoExists = response.data.items && response.data.items.length > 0;

    if (!videoExists) {
      errors.push("Video not found or not accessible.");
    }

    return {
      isValid: videoExists,
      errors
    };
  } catch (error) {
    console.error("Error validating YouTube video:", error.message);
    errors.push("Failed to verify video due to server/API error.");
    return { isValid: false, errors };
  }
}

module.exports = {
  validate
};