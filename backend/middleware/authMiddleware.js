// Middleware de verificare token, ca sa nu intre cineva neautorizat

import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
    // Scoatem token-ul din header, merge si cu auth-token si cu token simplu
    let token = req.headers['auth-token'] || req.headers.token;
    
    // Daca e trimis ca Bearer, il luam de acolo
    const authHeader = req.headers.authorization;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Nu esti autorizat! Logheaza-te!"
        });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Bagam info despre user in req, ca sa stim cine e
        req.user = {
            id: decoded.id,
            isAdmin: decoded.isAdmin || false
        };
        
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({
            success: false,
            message: "Token invalid sau expirat"
        });
    }
}; 