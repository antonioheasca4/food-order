// Middleware de autentificare, verifica daca ai token si daca e bun

import jwt from "jsonwebtoken"

const authMiddleware = async (req,res,next) => {
    // Scoatem token-ul din header, merge si cu token simplu si cu Bearer
    let token = req.headers.token;
    
    // Daca e trimis ca Bearer, il luam de acolo
    const authHeader = req.headers.authorization;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    
    if(!token){
        return res.status(401).json({success:false, message:"Nu esti autorizat! Logheaza-te!"})
    }
    
    try {
        const tokenDecode = jwt.verify(token,process.env.JWT_SECRET);
        req.userId = tokenDecode.id;
        req.body.userId = tokenDecode.id;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({success:false, message:"Token invalid sau expirat"})
    }
}

export default authMiddleware;