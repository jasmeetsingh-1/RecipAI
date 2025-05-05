const express = require('express');
const router = express.Router();
const axios = require('axios');
const { google } = require('googleapis');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY; 
const YOUTUBE_VIDEO_API = 'https://www.googleapis.com/youtube/v3/videos';
const YOUTUBE_CAPTIONS_API = 'https://www.googleapis.com/youtube/v3/captions';


const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID, 
  process.env.YOUTUBE_CLIENT_SECRET, 
  'http://localhost:3000/oauth2callback' 
);


oauth2Client.setCredentials({
  refresh_token: process.env.YOUTUBE_REFRESH_TOKEN 
});

const youtube = google.youtube({
  version: 'v3',
  auth: oauth2Client 
});

function extractVideoId(url) {
  const regex = /(?:v=|\/)([0-9A-Za-z_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}


function generateSummary(description, maxLength = 150) {
  if (!description) return 'No description available';
  return description.length > maxLength 
    ? description.substring(0, maxLength - 3) + '...' 
    : description;
}

async function fetchVideoContent(content) {
  const errors = [];

  if (!content) {
    errors.push('YouTube video URL is required in content.');
    return { isValid: false, errors };
  }

  const videoId = extractVideoId(content);

  if (!videoId) {
    errors.push('Invalid YouTube URL format. Not able to extract video ID');
    return { isValid: false, errors };
  }

  console.log("Hitting YouTube API for video ID:", videoId);

  try {
    
    const videoResponse = await axios.get(YOUTUBE_VIDEO_API, {
      params: {
        id: videoId,
        key: YOUTUBE_API_KEY,
        part: 'snippet,contentDetails',
      },
    });

    console.log("YOUTUBE_VIDEO_API response:", videoResponse.data);

    const videoData = videoResponse.data.items[0];
    if (!videoData) {
      errors.push('Video not found or not accessible.');
      return { isValid: false, errors };
    }

    const snippet = videoData.snippet;
    const contentDetails = videoData.contentDetails;

    
    let transcription = 'Transcription not available';
    let captionDebugInfo = '';
    try {
      
      const captionsResponse = await axios.get(YOUTUBE_CAPTIONS_API, {
        params: {
          videoId: videoId,
          key: YOUTUBE_API_KEY,
          part: 'snippet',
        },
      });

      console.log("YOUTUBE_CAPTIONS_API response:", captionsResponse.data);

      const captions = captionsResponse.data.items;
      if (!captions || captions.length === 0) {
        captionDebugInfo = 'No captions available for this video.';
      } else {
        
        const englishCaption = captions.find(caption => 
          caption.snippet.language.startsWith('en')
        );

        if (englishCaption) {
          try {
            
            const captionTrackResponse = await youtube.captions.download({
              id: englishCaption.id,
              tfmt: 'srt', 
            });
            transcription = captionTrackResponse.data; 
            captionDebugInfo = `Retrieved captions in language: ${englishCaption.snippet.language}`;
          } catch (captionDownloadError) {
            console.warn('Failed to download caption track:', captionDownloadError.message);
            captionDebugInfo = `Failed to download English caption (lang: ${englishCaption.snippet.language}). Error: ${captionDownloadError.message}`;
          }
        } else {
          
          const availableLanguages = captions.map(c => c.snippet.language).join(', ');
          captionDebugInfo = `No English captions found. Available languages: ${availableLanguages}`;
        }
      }
    } catch (captionError) {
      console.warn('Error fetching captions:', captionError.message);
      captionDebugInfo = `Error accessing captions API: ${captionError.message}`;
    }

    
    if (transcription === 'Transcription not available') {
      console.log(`Caption debug for video ${videoId}: ${captionDebugInfo}`);
    }

    
    const metadata = {
      title: snippet.title,
      description: snippet.description,
      summary: generateSummary(snippet.description),
      tags: snippet.tags || [],
      duration: contentDetails.duration, 
      transcription: transcription,
      captionDebugInfo: captionDebugInfo, 
    };

    return { isValid: true, metadata, errors: [] };
  } catch (error) {
    console.error('Error fetching video metadata:', error.message);
    errors.push('Failed to fetch video metadata due to server/API error.');
    return { isValid: false, errors };
  }
}

module.exports = {
  fetchVideoContent
};