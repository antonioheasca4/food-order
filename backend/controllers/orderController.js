import Order from "../models/orderModel.js";
import userModel from "../models/userModel.js";

// Creare comandă nouă
export const createOrder = async (req, res) => {
    try {
        console.log("CreateOrder fiind apelat cu datele:", JSON.stringify(req.body, null, 2));
        console.log("UserId din token:", req.userId);
        
        const { 
            items, 
            deliveryInfo, 
            subtotal, 
            discount, 
            deliveryFee,
            total, 
            promoCodeApplied, 
            notes,
        } = req.body;

        // Folosim userId din token sau din body (pentru compatibilitate)
        const userId = req.userId || req.body.userId;

        // Verificăm dacă utilizatorul există
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilizatorul nu a fost găsit' });
        }

        // Verificăm dacă codul promoțional a fost folosit deja de acest utilizator
        if (promoCodeApplied && user.usedPromoCodes && user.usedPromoCodes.includes(promoCodeApplied)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Acest cod promoțional a fost deja folosit de către tine și nu mai poate fi aplicat din nou.'
            });
        }

        // Creăm comanda
        const newOrder = new Order({
            userId,
            items,
            deliveryInfo,
            subtotal,
            discount: discount || 0,
            deliveryFee,
            total,
            promoCodeApplied: promoCodeApplied || null,
            notes: notes || '',
            status: 'pending'
        });

        // Salvăm comanda
        await newOrder.save();

        // Dacă s-a folosit un cod promoțional, îl adăugăm la lista de coduri folosite
        if (promoCodeApplied) {
            // Verificăm dacă utilizatorul are deja o listă de coduri promoționale folosite
            const usedPromoCodes = user.usedPromoCodes || [];
            usedPromoCodes.push(promoCodeApplied);

            // Actualizăm utilizatorul cu noua listă de coduri promoționale folosite
            await userModel.findByIdAndUpdate(userId, {
                usedPromoCodes: usedPromoCodes,
                cartData: {},
                optionsData: {}
            });
        } else {
            // Golim coșul utilizatorului după plasarea comenzii (dacă nu s-a folosit cod promoțional)
            await userModel.findByIdAndUpdate(userId, {
                cartData: {},
                optionsData: {}
            });
        }

        res.status(201).json({ 
            success: true, 
            message: 'Comandă plasată cu succes', 
            orderId: newOrder._id 
        });
    } catch (error) {
        console.error('Eroare la crearea comenzii:', error);
        res.status(500).json({ success: false, message: 'Eroare la plasarea comenzii' });
    }
};

// Obține toate comenzile unui utilizator
export const getUserOrders = async (req, res) => {
    try {
        const orders = await Order
            .find({ userId: req.userId })
            .sort({ createdAt: -1 }); // Cele mai recente comenzi primele

        res.json({ success: true, orders });
    } catch (error) {
        console.error('Eroare la obținerea comenzilor:', error);
        res.status(500).json({ success: false, message: 'Eroare la obținerea comenzilor' });
    }
};

// Obține o comandă specifică după ID
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Comanda nu a fost găsită' });
        }

        // Verificăm dacă utilizatorul are acces la această comandă
        if (order.userId.toString() !== req.userId && !req.isAdmin) {
            return res.status(403).json({ success: false, message: 'Nu aveți permisiunea de a accesa această comandă' });
        }

        res.json({ success: true, order });
    } catch (error) {
        console.error('Eroare la obținerea comenzii:', error);
        res.status(500).json({ success: false, message: 'Eroare la obținerea comenzii' });
    }
};

// Actualizează statusul unei comenzi (doar pentru admin)
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Status invalid' });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: 'Comanda nu a fost găsită' });
        }

        res.json({ success: true, message: 'Status actualizat cu succes', order: updatedOrder });
    } catch (error) {
        console.error('Eroare la actualizarea statusului comenzii:', error);
        res.status(500).json({ success: false, message: 'Eroare la actualizarea statusului comenzii' });
    }
};

// Obține toate comenzile (doar pentru admin)
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order
            .find()
            .sort({ createdAt: -1 });

        res.json({ success: true, orders });
    } catch (error) {
        console.error('Eroare la obținerea tuturor comenzilor:', error);
        res.status(500).json({ success: false, message: 'Eroare la obținerea comenzilor' });
    }
}; 