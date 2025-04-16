import userModel, { DeletedEmail } from "../models/userModel.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import validator from "validator"


//login user
const loginUser = async (req,res) => {
    const {email,password} = req.body;
    try {
        const user = await userModel.findOne({email})
        if(!user)
        {
            return res.json({succes:false,message:"Utilizatorul nu există!"})
        }

        const isMatch = await bcrypt.compare(password,user.password)

        if(!isMatch){
            return res.json({succes:false,message:"Parolă incorectă!"})
        }

        const token = createToken(user._id);

        res.json({succes:true,token})

    } catch (error) {
        console.log(error)
        res.json({succes:false,message:"Error"})
    }
}

const createToken = (id) => {
    return jwt.sign({id},process.env.JWT_SECRET)
}

//register user
const registerUser = async(req,res) => {
    const {name,password,email} = req.body;
    try {
        // checking if user already exists
        const exists = await userModel.findOne({email})
        if(exists){
            return res.json({succes:false,message:"Utilizatorul deja există!"})
        }

        // Verificăm dacă emailul a aparținut unui cont șters anterior
        const isDeletedEmail = await DeletedEmail.findOne({ email });
        if (isDeletedEmail) {
            return res.json({succes:false,message:"Acest email a aparținut unui cont șters și nu poate fi folosit din nou."})
        }

        // validating email format & strong password
        if(!validator.isEmail(email))
        {
            return res.json({succes:false,message:"Te rog introdu un email valid!"})
        }

        if(password.length < 8)
        {
            return res.json({succes:false,message:"Parola trebuie să conțină cel puțin 8 caractere!"})
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt)

        const newUser = new userModel({
            name:name,
            email:email,
            password:hashedPassword
        })

        const user = await newUser.save();

        const token = createToken(user._id);
        res.json({succes:true,token});

    } catch (error) {
        console.log(error)
        res.json({succes:false,message:"Error"})
    }
}

// Obține informațiile utilizatorului autentificat
const getUserInfo = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilizatorul nu a fost găsit' });
        }
        
        // Returnăm doar datele necesare, fără parola
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                usedPromoCodes: user.usedPromoCodes || []
            }
        });
    } catch (error) {
        console.error('Eroare la obținerea informațiilor utilizatorului:', error);
        res.status(500).json({ success: false, message: 'Eroare la obținerea informațiilor utilizatorului' });
    }
};

// Funcție pentru crearea utilizatorului admin
const createAdminUser = async (req, res) => {
    try {
        // Verifică dacă există deja un utilizator admin
        const adminExists = await userModel.findOne({ email: "admin@popotaatm.com" });
        
        if (adminExists) {
            // Doar actualizăm drepturile de administrator
            adminExists.isAdmin = true;
            await adminExists.save();
            return res.json({ succes: true, message: "Utilizatorul admin există deja. Drepturi de administrator actualizate!" });
        }
        
        // Creăm parola hash
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("admin123", salt);
        
        // Creăm utilizatorul admin
        const adminUser = new userModel({
            name: "Administrator",
            email: "admin@popotaatm.com",
            password: hashedPassword,
            isAdmin: true,
            cartData: {},
            optionsData: {}
        });
        
        await adminUser.save();
        
        res.json({ succes: true, message: "Utilizator admin creat cu succes!" });
    } catch (error) {
        console.error("Eroare la crearea utilizatorului admin:", error);
        res.status(500).json({ succes: false, message: "Eroare la crearea utilizatorului admin" });
    }
};

// Funcție pentru obținerea tuturor utilizatorilor (doar pentru admin)
const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find({}, '-password'); // Excludem parola din rezultate
        
        res.json({
            success: true,
            users: users.map(user => ({
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                usedPromoCodes: user.usedPromoCodes || []
            }))
        });
    } catch (error) {
        console.error('Eroare la obținerea listei de utilizatori:', error);
        res.status(500).json({ success: false, message: 'Eroare la obținerea listei de utilizatori' });
    }
};

// Funcție pentru ștergerea unui utilizator (doar pentru admin)
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Verificăm dacă utilizatorul există
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilizatorul nu a fost găsit' });
        }
        
        // Nu permitem ștergerea contului de admin
        if (user.isAdmin) {
            return res.status(403).json({ success: false, message: 'Nu se poate șterge un cont de administrator' });
        }
        
        // Salvăm emailul în lista de emailuri șterse
        const deletedEmail = new DeletedEmail({
            email: user.email
        });
        await deletedEmail.save();
        
        // Ștergem utilizatorul
        await userModel.findByIdAndDelete(userId);
        
        res.json({ success: true, message: 'Utilizator șters cu succes' });
    } catch (error) {
        console.error('Eroare la ștergerea utilizatorului:', error);
        res.status(500).json({ success: false, message: 'Eroare la ștergerea utilizatorului' });
    }
};

// Funcție pentru schimbarea parolei utilizatorului
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // Verificăm dacă noua parolă este furnizată
        if (!newPassword) {
            return res.status(400).json({ success: false, message: 'Noua parolă este obligatorie' });
        }
        
        // Verificăm dacă noua parolă respectă cerințele de securitate
        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'Noua parolă trebuie să conțină cel puțin 8 caractere' });
        }
        
        // Găsim utilizatorul după ID (din tokenul JWT)
        const user = await userModel.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilizatorul nu a fost găsit' });
        }
        
        // Verificăm dacă parola actuală este corectă
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Parola actuală este incorectă' });
        }
        
        // Generăm hash pentru noua parolă
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // Actualizăm parola în baza de date
        user.password = hashedPassword;
        await user.save();
        
        res.json({ success: true, message: 'Parola a fost schimbată cu succes' });
    } catch (error) {
        console.error('Eroare la schimbarea parolei:', error);
        res.status(500).json({ success: false, message: 'Eroare la schimbarea parolei' });
    }
};

// Funcție pentru actualizarea numelui utilizatorului
const updateUserName = async (req, res) => {
    try {
        const { name } = req.body;
        
        // Verificăm dacă numele este furnizat
        if (!name || name.trim() === '') {
            return res.status(400).json({ success: false, message: 'Numele este obligatoriu' });
        }
        
        // Găsim utilizatorul după ID (din tokenul JWT)
        const user = await userModel.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilizatorul nu a fost găsit' });
        }
        
        // Actualizăm numele în baza de date
        user.name = name;
        await user.save();
        
        res.json({ 
            success: true, 
            message: 'Numele a fost actualizat cu succes',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                usedPromoCodes: user.usedPromoCodes || []
            }
        });
    } catch (error) {
        console.error('Eroare la actualizarea numelui:', error);
        res.status(500).json({ success: false, message: 'Eroare la actualizarea numelui' });
    }
};

export {loginUser, registerUser, createAdminUser, getUserInfo, getAllUsers, deleteUser, changePassword, updateUserName}