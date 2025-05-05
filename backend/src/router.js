const express = require('express');
const router = express.Router();

const youtubeValidator = require("./platformApi/youtube/youtube-service");
const youtubeContent  = require("./platformApi/youtube/youtube-router");
const instagramValidator = require("./platformApi/instagram-service");

router.post("/content-validate", async (req, res) => {
  try {
    const { platform, content } = req.body;

    if (!platform || !content) {
      return res.status(400).json({ error: "Missing platform or content in request body" });
    }

    let result;

    //add validator as per the platform
    switch (platform.toLowerCase()) {
      case 'youtube':
        result = await youtubeValidator.validate(content);
        break;
      case 'instagram':
        result = await instagramValidator.validate(content);
        break;
      default:
        return res.status(400).json({ error: "Unsupported platform" });
    }

    res.json({ success: true, result });

  } catch (error) {
    console.error("link validation error:", error);
    res.status(500).json({ error: "Error while validating the link" });
  }
});

router.post("/fetch-content", async (req,res) => {
  try{
    const { platform, content } = req.body;
    switch (platform.toLowerCase()) {
      case 'youtube':
        result = await youtubeContent.fetchVideoContent(content);
        break;
      default:
        return res.status(400).json({ error: "Unsupported platform" });
    }
    res.json({ success: true, result });

  } catch (error) {
    console.error("Validation error:", error);
    res.status(500).json({ error: "error in fetching link content" });
  }
})


module.exports = router;