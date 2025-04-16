import userModel from "../models/userModel.js";

const adminMiddleware = async (req, res, next) => {
    try {
        // Folosim userId din token (adăugat de middleware-ul auth)
        const userId = req.userId;
        
        console.log("Admin middleware - Checking user:", userId);
        
        if (!userId) {
            return res.status(401).json({ success: false, message: "Nu ești autentificat" });
        }
        
        const user = await userModel.findById(userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: "Utilizator negăsit" });
        }
        
        console.log("User found:", user.email, "isAdmin:", user.isAdmin);
        
        // Verificăm dacă utilizatorul are rol de admin
        if (!user.isAdmin) {
            return res.status(403).json({ success: false, message: "Acces interzis. Necesită drepturi de administrator." });
        }
        
        // Adăugăm flag-ul isAdmin la request pentru a fi folosit în controller
        req.isAdmin = true;
        next();
    } catch (error) {
        console.error("Eroare în middleware-ul admin:", error);
        res.status(500).json({ success: false, message: "Eroare la verificarea drepturilor de administrator" });
    }
};

export default adminMiddleware; 