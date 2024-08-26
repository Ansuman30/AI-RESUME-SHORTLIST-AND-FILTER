const JWT = require('jsonwebtoken');

const secret= "H311&H3@V3N";

function createToken(user){
    const payload={
        _id: user._id,
        email: user.email,
    }
    const token = JWT.sign(payload,secret);
    return token;
}

function verifytoken(token){
    const payload= JWT.verify(token,secret);
    return payload;
}

module.exports={createToken,verifytoken}