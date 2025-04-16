import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
    // Extrag token-ul din header - suport pentru ambele formate
    let token = req.headers['auth-token'] || req.headers.token;
    
    // Verifică dacă token-ul este trimis în format Authorization: Bearer {token}
    const authHeader = req.headers.authorization;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Nu ești autorizat! Loghează-te!"
        });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Adaugă informațiile utilizatorului la obiectul req
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