const express = require('express');
const instagramRouter = express.Router();


instagramRouter.get("/link-validtor", async(req,res)=>{
    return res.status(400).json({status:true,message:"Valid instagram link"})
})

module.exports = instagramRouter;