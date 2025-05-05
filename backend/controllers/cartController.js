// Controller pentru cosul de cumparaturi

import userModel from "../models/userModel.js"

// Adauga item in cosul userului
const addToCart = async (req,res) => {
    try {
        let userData = await userModel.findById(req.body.userId)
        let cartData = await userData.cartData;
        let optionsData = await userData.optionsData || {};
        
        //facem un id unic pentru itemul din cos
        let cartItemKey = req.body.itemId;
        
        // salvam optiunile produsului
        if (req.body.options && Object.keys(req.body.options).length > 0) {
            cartItemKey = `${req.body.itemId}_${JSON.stringify(req.body.options)}`;
            optionsData[cartItemKey] = req.body.options;
        }
        
        if(!cartData[cartItemKey])
        {
            cartData[cartItemKey] = 1;
        }
        else{
            cartData[cartItemKey] += 1;
        }
        
        await userModel.findByIdAndUpdate(req.body.userId, {
            cartData,
            optionsData
        });
        
        res.json({succes:true,message:"Adaugat in cos!"});
    } catch (error) {
        console.log(error);
        res.json({succes:false,message:"Error addToCart"});
    }
}

// Scoate item din cosul userului
const removeFromCart = async (req,res) => {
    try {
        let userData = await userModel.findById(req.body.userId)
        let cartData = await userData.cartData;
        let optionsData = await userData.optionsData || {};
        let itemRemoved = false;
        
        // Daca ai optiuni la produs, facem un id unic pentru itemul din cos
        let cartItemKey = req.body.itemId;
        
        if (req.body.options && Object.keys(req.body.options).length > 0) {
            cartItemKey = `${req.body.itemId}_${JSON.stringify(req.body.options)}`;
        }

        if(cartData[cartItemKey] > 0)
        {
            cartData[cartItemKey] -= 1;
            
            if(cartData[cartItemKey] === 0) {
                delete cartData[cartItemKey];
                // Daca ai optiuni, le stergem si pe ele
                if (optionsData[cartItemKey]) {
                    delete optionsData[cartItemKey];
                }
                itemRemoved = true;
            }

            await userModel.findByIdAndUpdate(req.body.userId, {
                cartData,
                optionsData
            });
            
            if(!itemRemoved) res.json({succes:true,message:"Eliminat din cos!"})
            else res.json({succes:true,message:"Eliminat din baza de date!"})
        }
        else{
            res.json({succes:false, message:"Cantitate deja 0!"});
        }
    } catch (error) {
        console.log(error);
        res.json({succes:false,message:"Error removeFromCart"})
    }
}

// Ia tot cosul userului
const getCart = async (req,res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        // Daca nu gasim userul, returnam eroare
        if (!userData) {
            return res.status(404).json({success:false, message:"Userul nu a fost gasit"});
        }
        let cartData = await userData.cartData;
        let optionsData = await userData.optionsData || {};
        res.json({
            succes:true,
            cartData,
            optionsData
        })
    } catch (error) {
        console.log(error);
        res.json({succes:false,message:"Error getCart"})
    }
}

// Goleste tot cosul userului
const clearCart = async (req,res) => {
    try {
        await userModel.findByIdAndUpdate(req.body.userId, {
            cartData: {},
            optionsData: {}
        });
        res.json({succes:true, message:"Cosul a fost golit!"});
    } catch (error) {
        console.log(error);
        res.json({succes:false, message:"Error clearCart"});
    }
}

export {addToCart,removeFromCart,getCart,clearCart}