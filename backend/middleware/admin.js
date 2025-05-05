// Middleware pentru admini, ca sa nu intre cine nu trebuie la panoul de admin

import userModel from "../models/userModel.js";

const adminMiddleware = async (req, res, next) => {
    try {
        // Luam userId din token (pus de middleware-ul de auth)
        const userId = req.userId;
        
        console.log("Admin middleware - Checking user:", userId);
        
        if (!userId) {
            return res.status(401).json({ success: false, message: "Nu esti autentificat" });
        }
        
        const user = await userModel.findById(userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: "Userul nu exista" });
        }
        
        console.log("User gasit:", user.email, "isAdmin:", user.isAdmin);
        
        // Verificam daca userul e admin
        if (!user.isAdmin) {
            return res.status(403).json({ success: false, message: "Nu ai voie aici, trebuie sa fii admin." });
        }
        
        // Punem flag-ul isAdmin pe request, poate avem nevoie mai incolo
        req.isAdmin = true;
        next();
    } catch (error) {
        console.error("Eroare in middleware-ul admin:", error);
        res.status(500).json({ success: false, message: "Eroare la verificarea drepturilor de admin" });
    }
};

export default adminMiddleware; 