import userModel from "../models/userModel.js"

// add items to user's cart
const addToCart = async (req,res) => {
    try {
        let userData = await userModel.findById(req.body.userId)
        let cartData = await userData.cartData;
        let optionsData = await userData.optionsData || {};
        
        // Generăm un ID unic pentru item-ul din coș dacă are opțiuni
        let cartItemKey = req.body.itemId;
        
        // Verificăm dacă există opțiuni pentru acest produs
        if (req.body.options && Object.keys(req.body.options).length > 0) {
            cartItemKey = `${req.body.itemId}_${JSON.stringify(req.body.options)}`;
            
            // Salvăm opțiunile în baza de date
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
        
        res.json({succes:true,message:"Adăugat în coș!"});
    } catch (error) {
        console.log(error);
        res.json({succes:false,message:"Error addToCart"});
    }
}

// remove items from user's cart
const removeFromCart = async (req,res) => {
    try {
        let userData = await userModel.findById(req.body.userId)
        let cartData = await userData.cartData;
        let optionsData = await userData.optionsData || {};
        let itemRemoved = false;
        
        // Generăm ID-ul unic pentru item-ul din coș
        let cartItemKey = req.body.itemId;
        
        // Verificăm dacă există opțiuni pentru acest produs
        if (req.body.options && Object.keys(req.body.options).length > 0) {
            cartItemKey = `${req.body.itemId}_${JSON.stringify(req.body.options)}`;
        }

        if(cartData[cartItemKey] > 0)
        {
            cartData[cartItemKey] -= 1;
            
            if(cartData[cartItemKey] === 0) {
                delete cartData[cartItemKey];
                
                // Eliminăm și opțiunile asociate dacă există
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

// fetch user's cart data
const getCart = async (req,res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        
        // Verifică dacă userData există
        if (!userData) {
            return res.status(404).json({success:false, message:"Utilizatorul nu a fost găsit"});
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

// clear all items from user's cart
const clearCart = async (req,res) => {
    try {
        await userModel.findByIdAndUpdate(req.body.userId, {
            cartData: {},
            optionsData: {}
        });
        
        res.json({succes:true, message:"Coșul a fost golit cu succes!"});
    } catch (error) {
        console.log(error);
        res.json({succes:false, message:"Error clearCart"});
    }
}

export {addToCart,removeFromCart,getCart,clearCart}