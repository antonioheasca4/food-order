import express from "express"
import { loginUser, registerUser, createAdminUser, getUserInfo, getAllUsers, deleteUser, changePassword, updateUserName } from "../controllers/userControllers.js"
import authMiddleware from "../middleware/auth.js"
import adminMiddleware from "../middleware/admin.js"

const userRouter = express.Router()

userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)
userRouter.post("/create-admin", createAdminUser)
userRouter.get("/create-admin", createAdminUser)
userRouter.get("/me", authMiddleware, getUserInfo)
userRouter.get("/admin/all", authMiddleware, adminMiddleware, getAllUsers)
userRouter.delete("/admin/:userId", authMiddleware, adminMiddleware, deleteUser)

// Rutele pentru gestionarea contului utilizatorului
userRouter.post("/change-password", authMiddleware, changePassword)
userRouter.post("/update-name", authMiddleware, updateUserName)

export default userRouter