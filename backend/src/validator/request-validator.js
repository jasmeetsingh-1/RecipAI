
const secretKeyValidator = (req, res, next) => {
    const { secretKey } = req.body;
 
    if(!secretKey){
     return res.status(401).json({status:false, message:"Unauthorized - secretKey missing"})
    }
    
    next();
 
 };
 
 module.exports = {
    secretKeyValidator
 };
 