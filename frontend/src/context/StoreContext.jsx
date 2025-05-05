import { createContext, useEffect, useState } from "react";
import axios from "axios"
import productOptionsData from '../mock/productOptions';

export const StoreContext = createContext(null)

const StoreContextProvider = (props) => {

    const [cartItems, setCartItems] = useState({});
    const [productOptions, setProductOptions] = useState({});
    const url = "http://localhost:4000"
    const [token,setToken] = useState("")
    const [food_list,setFoodList] = useState([])
    const [isDataLoaded, setIsDataLoaded] = useState(false); // Flag pentru a indica dacă datele sunt încărcate
    const [notification, setNotification] = useState(null);
    const [notificationTimeout, setNotificationTimeout] = useState(null);
    const [promoCode, setPromoCode] = useState(localStorage.getItem('promoCode') || '');
    const [discount, setDiscount] = useState(parseFloat(localStorage.getItem('discount') || 0));
    const [usedPromoCodes, setUsedPromoCodes] = useState([]);

    // Verifică dacă utilizatorul a folosit deja un anumit cod promoțional
    const checkUsedPromoCode = async (code) => {
        if (!token) return false;
        const exists = await checkIfUserExists(token);
        if (!exists) return false;
        
        try {
            // Obținem istoricul comenzilor utilizatorului
            const response = await axios.get(`${url}/api/orders/myorders`, {
                headers: { 
                    Authorization: `Bearer ${token}` 
                }
            });
            
            if (response.data.success && response.data.orders) {
                // Verificăm dacă codul a fost folosit în vreuna dintre comenzi
                const usedInOrders = response.data.orders.some(order => order.promoCodeApplied === code);
                
                if (usedInOrders) {
                    showNotification('Acest cod promoțional a fost deja folosit și nu mai poate fi aplicat din nou.', 'error');
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.error('Eroare la verificarea codului promoțional:', error);
            return false;
        }
    };

    // Funcție pentru a verifica codul promoțional
    const checkPromoCode = async (code) => {
        if (!token || !code) return false;
        const exists = await checkIfUserExists(token);
        if (!exists) return false;
        
        try {
            const response = await axios.get(`${url}/api/user/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success && response.data.user) {
                const userCodes = response.data.user.usedPromoCodes || [];
                
                // Dacă utilizatorul a folosit deja vreun cod, nu mai poate folosi altul
                if (userCodes.length > 0) {
                    showNotification('Ai folosit deja un cod promoțional. Fiecare utilizator poate folosi doar un singur cod.', 'error');
                    return false;
                }
                
                // Verificăm dacă codul este valid (începe cu POPOTA)
                if (code.startsWith('POPOTA')) {
                    return true;
                } else {
                    showNotification('Cod promoțional invalid.', 'error');
                    return false;
                }
            }
            
            return false;
        } catch (error) {
            console.error('Eroare la verificarea codului promoțional:', error);
            return false;
        }
    };

    // Funcție pentru a aplica codul promoțional
    const applyPromoCode = async (code) => {
        if (!code || !code.trim()) {
            showNotification('Te rugăm să introduci un cod promoțional.', 'error');
            return false;
        }
        if (token) {
            const exists = await checkIfUserExists(token);
            if (!exists) return false;
        }
        // Verificăm dacă codul promoțional este valid
        const isValidCode = await checkPromoCode(code);
        if (!isValidCode) {
            return false;
        }
        // Verificăm cu backend dacă userul a folosit deja acest cod
        try {
            const response = await axios.get(`${url}/api/user/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success && response.data.user) {
                const userCodes = response.data.user.usedPromoCodes || [];
                if (userCodes.includes(code)) {
                    showNotification('Ai folosit deja acest cod promoțional. Poți folosi fiecare cod o singură dată.', 'error');
                    return false;
                }
            }
        } catch (error) {
            console.error('Eroare la verificarea codului promoțional:', error);
            showNotification('A apărut o eroare la verificarea codului promoțional.', 'error');
            return false;
        }
        // Calculăm discount-ul de 15%
        const subtotal = getTotalCartAmount();
        const discountAmount = subtotal * 0.15;
        setPromoCode(code);
        setDiscount(discountAmount);
        // Salvăm în localStorage pentru persistență
        localStorage.setItem('promoCode', code);
        localStorage.setItem('discount', discountAmount.toString());
        showNotification('Codul promoțional a fost aplicat cu succes! Ai primit 15% reducere.', 'success');
        return true;
    };
    
    // Funcție pentru a elimina codul promoțional
    const removePromoCode = () => {
        setPromoCode('');
        setDiscount(0);
        
        // Ștergem din localStorage
        localStorage.removeItem('promoCode');
        localStorage.removeItem('discount');
        
        showNotification('Codul promoțional a fost eliminat.', 'success');
    };

    // Funcție pentru a șterge codul promoțional fără a afișa notificare
    const removePromoCodeSilent = () => {
        setPromoCode('');
        setDiscount(0);
        
        // Ștergem din localStorage
        localStorage.removeItem('promoCode');
        localStorage.removeItem('discount');
    };

    // Funcție pentru a șterge coșul și setările promoționale în starea locală
    const clearCartLocally = () => {
        setCartItems({});
        setProductOptions({});
        removePromoCodeSilent(); // Folosim versiunea fără notificare
    };

    // Funcție pentru a afișa notificări
    const showNotification = (message, type = 'success', duration = 3000) => {
        // Curățăm timeout-ul anterior dacă există
        if (notificationTimeout) {
            clearTimeout(notificationTimeout);
        }
        
        // Setăm notificarea
        setNotification({ message, type, duration });
        
        // Setăm un nou timeout pentru a închide notificarea
        const timeout = setTimeout(() => {
            setNotification(null);
        }, duration);
        
        setNotificationTimeout(timeout);
    };

    // Funcție pentru a închide notificarea
    const closeNotification = () => {
        // Curățăm timeout-ul dacă există
        if (notificationTimeout) {
            clearTimeout(notificationTimeout);
            setNotificationTimeout(null);
        }
        
        setNotification(null);
    };

    const addToCart = async (itemId, options = {}) => {
        if (token) {
            const exists = await checkIfUserExists(token);
            if (!exists) return;
        }
        const cartItemKey = options && Object.keys(options).length > 0 
            ? `${itemId}_${JSON.stringify(options)}` 
            : itemId;
            
        if (!cartItems[cartItemKey]) {
            setCartItems((prev) => ({ ...prev, [cartItemKey]: 1 }))
        }
        else {
            setCartItems((prev) => ({ ...prev, [cartItemKey]: prev[cartItemKey] + 1 }))
        }

        // Salvează opțiunile pentru acest item
        if (options && Object.keys(options).length > 0) {
            setProductOptions(prev => ({
                ...prev,
                [cartItemKey]: options
            }));
        }

        // Afișăm o notificare de succes
        const product = food_list.find(item => item._id === itemId);
        if (product) {
            // Creăm un mesaj care include numele produsului
            let message = `"${product.name}" a fost adăugat în coș`;
            
            // Adăugăm detalii despre opțiuni dacă există
            if (options && Object.keys(options).length > 0) {
                let optionsDetails = [];
                
                // Parcurgem fiecare tip de opțiune selectată
                Object.keys(options).forEach(optionType => {
                    const option = options[optionType];
                    
                    // Pentru opțiuni multiple (checkbox-uri)
                    if (typeof option === 'object' && !option.id) {
                        const selectedIds = Object.keys(option).filter(id => option[id]);
                        if (selectedIds.length > 0) {
                            const selectedOptions = selectedIds.map(id => {
                                const optInfo = getOptionInfo(product, optionType, id);
                                return optInfo ? optInfo.name : id;
                            }).filter(Boolean);
                            
                            if (selectedOptions.length > 0) {
                                optionsDetails.push(selectedOptions.join(', '));
                            }
                        }
                    } 
                    // Pentru opțiuni simple (radio)
                    else if (option.id) {
                        const optInfo = getOptionInfo(product, optionType, option.id);
                        if (optInfo) {
                            optionsDetails.push(optInfo.name);
                        }
                    }
                });
                
                if (optionsDetails.length > 0) {
                    message += ` cu: ${optionsDetails.join('; ')}`;
                }
            }
            
            showNotification(message, 'success');
        }

        // When the user is logged, add the changes of the cart in the database
        if (token) {
            await axios.post(url + "/api/cart/add", { itemId, options }, {headers:{token}});
        }
        
        // Actualizăm discount-ul dacă există un cod promoțional aplicat
        if (promoCode) {
            const newSubtotal = getTotalCartAmount();
            const newDiscount = newSubtotal * 0.15;
            setDiscount(newDiscount);
            localStorage.setItem('discount', newDiscount.toString());
        }
    }

    const removeFromCart = async (cartItemKey) => {
        if (token) {
            const exists = await checkIfUserExists(token);
            if (!exists) return;
        }
        setCartItems((prev) => ({ ...prev, [cartItemKey]: prev[cartItemKey] - 1 }))
        
        // Dacă cantitatea ajunge la 0, șterge și opțiunile asociate
        if (cartItems[cartItemKey] <= 1) {
            setProductOptions(prev => {
                const newOptions = {...prev};
                delete newOptions[cartItemKey];
                return newOptions;
            });
        }
        
        if (token) {
            // Extrage itemId din cartItemKey dacă conține opțiuni
            let itemId = cartItemKey;
            let options = {};
            
            if (cartItemKey.includes('_')) {
                const parts = cartItemKey.split('_');
                itemId = parts[0];
                options = JSON.parse(parts[1]);
            }
            
            await axios.post(url + "/api/cart/remove", { itemId, options }, {headers:{token}});
        }
        
        // Actualizăm discount-ul dacă există un cod promoțional aplicat
        if (promoCode) {
            // Calculăm noul subtotal după ce am șters un produs
            // Setăm un timeout pentru a permite actualizarea state-ului cartItems
            setTimeout(() => {
                const newSubtotal = getTotalCartAmount();
                const newDiscount = newSubtotal * 0.15;
                setDiscount(newDiscount);
                localStorage.setItem('discount', newDiscount.toString());
            }, 0);
        }
    }

    // Funcție pentru a obține opțiunile disponibile pentru un produs din datele de test
    const getProductOptionsData = (product) => {
        if (!product || !product.category) return null;
        
        // Mapare între categorii și opțiunile disponibile
        const categoryMap = {
            'salads': 'salad_options',
            'salata': 'salad_options',
            'desert': 'dessert_options',
            'deserts': 'dessert_options',
            'sweets': 'dessert_options',
            'pizza': 'pizza_options',
            'drinks': 'drink_options',
            'bauturi': 'drink_options'
        };
        
        const categoryKey = product.category.toLowerCase();
        if (categoryMap[categoryKey] && productOptionsData[categoryMap[categoryKey]]) {
            return productOptionsData[categoryMap[categoryKey]];
        }
        
        return null;
    };

    // Funcție pentru a obține informații despre o opțiune (preț, nume, etc.)
    const getOptionInfo = (product, optionType, optionId) => {
        if (!product || !optionType || !optionId) return null;
        
        // Verificăm mai întâi opțiunile produsului
        if (product.options && product.options.length > 0) {
            const optionGroup = product.options.find(group => group.type === optionType);
            if (optionGroup) {
                const optItem = optionGroup.items.find(item => item.id === optionId);
                if (optItem) return optItem;
            }
        }
        
        // Dacă nu găsim în produs, verificăm datele de test pentru categorie
        const fallbackOptions = getProductOptionsData(product);
        if (fallbackOptions) {
            const optionGroup = fallbackOptions.find(group => group.type === optionType);
            if (optionGroup) {
                const optItem = optionGroup.items.find(item => item.id === optionId);
                if (optItem) return optItem;
            }
        }
        
        return null;
    };

    // Funcție pentru a calcula prețul total pentru un produs cu opțiuni
    const calculateItemPrice = (product, selectedOptions) => {
        if (!product) return 0;
        
        let price = product.price;
        
        if (selectedOptions && Object.keys(selectedOptions).length > 0) {
            Object.keys(selectedOptions).forEach(optionType => {
                const option = selectedOptions[optionType];
                
                // Pentru opțiuni multiple (checkbox-uri)
                if (typeof option === 'object' && !option.id) {
                    Object.keys(option).forEach(optId => {
                        if (option[optId]) {
                            const optInfo = getOptionInfo(product, optionType, optId);
                            if (optInfo && optInfo.price) {
                                price += optInfo.price;
                            }
                        }
                    });
                }
                // Pentru opțiuni simple (radio)
                else if (option.id) {
                    const optInfo = getOptionInfo(product, optionType, option.id);
                    if (optInfo && optInfo.price) {
                        price += optInfo.price;
                    }
                }
            });
        }
        
        return price;
    };
    
    const getTotalCartAmount = () => {
        // Dacă food_list nu este încărcat sau nu are elemente, returnăm 0 fără warning
        if (!isDataLoaded || !food_list || food_list.length === 0) {
            return 0;
        }
        
        let totalAmount = 0;
        for (const cartItemKey in cartItems) {
            if (cartItems[cartItemKey] > 0) {
                // Extrage itemId din cartItemKey
                let itemId = cartItemKey;
                if (cartItemKey.includes('_')) {
                    itemId = cartItemKey.split('_')[0];
                }
                
                let itemInfo = food_list.find((product) => product._id === itemId);
                
                if (itemInfo) {
                    const options = productOptions[cartItemKey] || {};
                    const itemPrice = calculateItemPrice(itemInfo, options);
                    totalAmount += itemPrice * cartItems[cartItemKey];
                } else if (food_list.length > 0) { // Verificăm doar dacă food_list are elemente
                    console.warn(`Product with ID ${itemId} not found in food_list`);
                }
            }
        }
        return totalAmount;
    }

    // Funcție pentru a obține totalul cu discount inclus
    const getTotalWithDiscount = () => {
        const subtotal = getTotalCartAmount();
        const deliveryFee = subtotal > 0 ? 2 : 0;
        return subtotal + deliveryFee - discount;
    }

    const fetchFoodList = async () => {
        try {
            const response = await axios.get(url+"/api/food/list");
            setFoodList(response.data.data);
            setIsDataLoaded(true); // Marcăm datele ca fiind încărcate
        } catch (error) {
            console.error("Eroare la încărcarea listei de produse:", error);
            setIsDataLoaded(false);
        }
    }

    // Funcție pentru a obține lista codurilor promoționale utilizate
    const fetchUsedPromoCodes = async () => {
        if (!token) return;
        
        try {
            const response = await axios.get(`${url}/api/orders/myorders`, {
                headers: { 
                    Authorization: `Bearer ${token}` 
                }
            });
            
            if (response.data.success && response.data.orders) {
                // Extragem toate codurile promoționale din comenzi
                const codes = response.data.orders
                    .filter(order => order.promoCodeApplied)
                    .map(order => order.promoCodeApplied);
                
                // Eliminăm duplicatele
                const uniqueCodes = [...new Set(codes)];
                setUsedPromoCodes(uniqueCodes);
            }
        } catch (error) {
            console.error('Eroare la obținerea codurilor promoționale utilizate:', error);
        }
    };

    const loadCartData = async (token) => {
        try {
            const response = await axios.post(url + "/api/cart/get", {}, { headers: { token } });
            
            // Verificăm dacă avem un răspuns valid
            if (!response.data || response.data.success === false) {
                console.warn("Răspuns invalid sau eroare de la server:", response.data);
                clearCartLocally();
                return;
            }
            
            // Verificăm dacă coșul este gol
            const cartData = response.data.cartData || {};
            if (!cartData || Object.keys(cartData).length === 0) {
                // Dacă coșul de pe server este gol, ștergem și starea locală
                clearCartLocally();
                return;
            }
            
            setCartItems(cartData);
            
            // Încarcă și opțiunile salvate, dacă sunt disponibile
            if (response.data.optionsData) {
                setProductOptions(response.data.optionsData);
            }
            
            // Verificăm dacă există un cod promoțional salvat local
            const storedPromoCode = localStorage.getItem('promoCode');
            const storedDiscount = localStorage.getItem('discount');
            
            // Dacă există cod promoțional și coșul nu este gol, actualizăm discount-ul
            if (storedPromoCode && storedDiscount && Object.keys(cartData).length > 0) {
                // Asigurăm-ne că food_list este încărcat înainte de a calcula discount-ul
                setTimeout(() => {
                    const newSubtotal = getTotalCartAmount();
                    const newDiscount = newSubtotal * 0.15;
                    setPromoCode(storedPromoCode);
                    setDiscount(newDiscount);
                    localStorage.setItem('discount', newDiscount.toString());
                }, 500);
            } else if (storedPromoCode && Object.keys(cartData).length === 0) {
                // Dacă există cod promoțional dar coșul este gol, ștergem codul
                removePromoCodeSilent();
            }
        } catch (error) {
            console.error("Eroare la încărcarea datelor coșului:", error);
            clearCartLocally();
        }
    }

    // Funcție pentru a obține opțiunile disponibile pentru un anumit produs
    const getProductOptions = async (productId) => {
        try {
            const product = food_list.find(item => item._id === productId);
            if (!product) return [];
            
            // Verificăm dacă produsul are opțiuni definite
            if (product.options && product.options.length > 0) {
                return product.options;
            }
            
            // Altfel, încercăm să obținem opțiunile pentru categoria produsului
            const response = await axios.get(`${url}/api/food/options/${product.category}`);
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            
            // Dacă nu există opțiuni pe server, folosim datele de test
            return getProductOptionsData(product);
        } catch (error) {
            console.error("Eroare la obținerea opțiunilor pentru produs:", error);
            // Folosim datele de test în caz de eroare
            const product = food_list.find(item => item._id === productId);
            return getProductOptionsData(product);
        }
    }

    // Funcție pentru a obține opțiunile selectate pentru un produs din coș
    const getSelectedOptions = (cartItemKey) => {
        return productOptions[cartItemKey] || {};
    }

    // Funcție pentru a verifica dacă utilizatorul mai există în baza de date
    const checkIfUserExists = async (token) => {
        try {
            const response = await axios.get(`${url}/api/user/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.data.success || !response.data.user) {
                throw new Error();
            }
            return true;
        } catch (error) {
            // Deconectăm utilizatorul și afișăm mesaj
            setToken("");
            localStorage.removeItem("token");
            showNotification("Contul tău a fost șters sau sesiunea a expirat. Te rugăm să contactezi administratorul.", "error");
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            return false;
        }
    };

    useEffect(()=> {
        async function loadData(){
            setIsDataLoaded(false);
            await fetchFoodList();
            if(localStorage.getItem("token")) {
                setToken(localStorage.getItem("token"));
                // Verificăm dacă userul mai există
                const exists = await checkIfUserExists(localStorage.getItem("token"));
                if (!exists) return;
                await loadCartData(localStorage.getItem("token"));
                await fetchUsedPromoCodes();
            } else {
                if (Object.keys(cartItems).length === 0 && localStorage.getItem("promoCode")) {
                    removePromoCodeSilent();
                }
            }
        }
        if (Object.keys(cartItems).length === 0 && localStorage.getItem("promoCode")) {
            removePromoCodeSilent();
        }
        loadData();
        return () => {
            if (notificationTimeout) {
                clearTimeout(notificationTimeout);
            }
        };
    },[]);

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        getTotalWithDiscount,
        url,
        token,
        setToken,
        isDataLoaded,
        productOptions,
        getProductOptions,
        getSelectedOptions,
        getProductOptionsData,
        getOptionInfo,
        calculateItemPrice,
        notification,
        showNotification,
        closeNotification,
        promoCode,
        discount,
        applyPromoCode,
        removePromoCode,
        removePromoCodeSilent,
        clearCartLocally,
        usedPromoCodes
    }

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}


export default StoreContextProvider