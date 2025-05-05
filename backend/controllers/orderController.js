// Controller pentru comenzi

import Order from "../models/orderModel.js";
import userModel from "../models/userModel.js";

// Adauga o comanda noua
const addOrder = async (req, res) => {
    try {
        // Verifică dacă există cod promoțional și userId
        const promoCode = req.body.promoCode || req.body.promoCodeApplied;
        let userId = req.body.userId;
        if (!userId && req.userId) userId = req.userId;
        let user = null;
        if (userId) {
            user = await userModel.findById(userId);
        }
        // Dacă există cod promoțional și userul e logat
        if (promoCode && user) {
            // Verifică dacă userul a mai folosit codul
            if (user.usedPromoCodes && user.usedPromoCodes.includes(promoCode)) {
                return res.json({ success: false, message: "Ai folosit deja acest cod promoțional!" });
            }
            // Marchează codul ca folosit
            user.usedPromoCodes.push(promoCode);
            await user.save();
        }
        // Creează comanda
        const order = new Order(req.body);
        await order.save();
        res.json({ success: true, message: "Comanda adaugata!" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Eroare la adaugare comanda" });
    }
};

// Ia toate comenzile unui user
const getUserOrders = async (req, res) => {
    try {
        const userId = req.userId;
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Eroare la luat comenzile userului" });
    }
};

// Ia toate comenzile (admin)
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).sort({ createdAt: -1 });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Eroare la luat toate comenzile" });
    }
};

// Editeaza statusul unei comenzi
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        await Order.findByIdAndUpdate(orderId, { status });
        res.json({ success: true, message: "Status comanda schimbat!" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Eroare la schimbare status" });
    }
};

// Sterge o comanda
const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        await Order.findByIdAndDelete(orderId);
        res.json({ success: true, message: "Comanda stearsa!" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Eroare la sters comanda" });
    }
};

export { addOrder, getUserOrders, getAllOrders, updateOrderStatus, deleteOrder }; 