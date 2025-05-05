import express from "express";
import { addOrder, getUserOrders, updateOrderStatus, getAllOrders } from "../controllers/orderController.js";
import authMiddleware from "../middleware/auth.js";
import adminMiddleware from "../middleware/admin.js";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";

const orderRouter = express.Router();

// Rute pentru utilizatori normali
orderRouter.post("/create", authMiddleware, addOrder);
orderRouter.get("/myorders", authMiddleware, getUserOrders);
// orderRouter.get("/:id", authMiddleware, getOrderById);

// Rute pentru administratori
orderRouter.get("/admin/all", authMiddleware, adminMiddleware, getAllOrders);
orderRouter.patch("/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);

export default orderRouter; 