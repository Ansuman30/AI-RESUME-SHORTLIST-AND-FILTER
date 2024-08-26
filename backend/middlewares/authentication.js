const { verifytoken } = require("../services/auth");

function checkforauthcookie(cookiename){
    return (req,res,next)=>{
        const tokenCookie=req.cookies[cookiename];
        if(!tokenCookie) {
            return next();
        }

        try{
            const userPayload=verifytoken(tokenCookie);
            req.user=userPayload;
        }catch(error){

        };
        return next();
    }
}

module.exports={checkforauthcookie};