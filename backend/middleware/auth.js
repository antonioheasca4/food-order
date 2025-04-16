import jwt from "jsonwebtoken"

const authMiddleware = async (req,res,next) => {
    // Extrag token-ul din header - suport pentru ambele formate
    let token = req.headers.token;
    
    // Verifică dacă token-ul este trimis în format Authorization: Bearer {token}
    const authHeader = req.headers.authorization;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    
    if(!token){
        return res.status(401).json({success:false, message:"Nu ești autorizat! Loghează-te!"})
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