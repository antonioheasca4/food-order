import React, { useContext, useState, useEffect } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../context/StoreContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const PlaceOrder = () => {
  const { 
    cartItems, 
    getTotalCartAmount, 
    url, 
    token, 
    food_list, 
    productOptions, 
    calculateItemPrice, 
    setCartItems, 
    showNotification,
    clearCartLocally,
    isDataLoaded
  } = useContext(StoreContext);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState(null);
  const navigate = useNavigate();

  // Calculăm valorile doar dacă avem datele încărcate
  const subtotal = isDataLoaded ? getTotalCartAmount() : 0;
  const deliveryFee = subtotal === 0 ? 0 : 2;
  const total = subtotal + deliveryFee - discount;

  // Încărcăm codul promoțional din localStorage dacă există
  useEffect(() => {
    const storedPromoCode = localStorage.getItem('promoCode');
    const storedDiscount = localStorage.getItem('discount');
    
    if (storedPromoCode && storedDiscount) {
      setPromoCode(storedPromoCode);
      setAppliedPromoCode(storedPromoCode);
      setDiscount(parseFloat(storedDiscount));
    }
  }, []);

  // Extrage ID-ul produsului din cheie
  const getProductId = (cartItemKey) => {
    if (cartItemKey.includes('_')) {
      return cartItemKey.split('_')[0];
    }
    return cartItemKey;
  };

  // Obține produsul din lista de produse
  const getProduct = (cartItemKey) => {
    const productId = getProductId(cartItemKey);
    
    // Verificare dacă food_list este disponibil și nu este gol
    if (!food_list || food_list.length === 0) {
      console.error('Lista de produse nu este disponibilă');
      return null;
    }
    
    const product = food_list.find(item => item._id === productId);
    
    if (!product) {
      console.error(`Produs cu ID-ul ${productId} nu a fost găsit în lista de produse.`);
      return null;
    }
    
    return product;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Funcție pentru a aplica codul promoțional
  const applyPromoCode = async () => {
    // Verificăm dacă codul promoțional este gol
    if (!promoCode.trim()) {
      showNotification('Te rugăm să introduci un cod promoțional.', 'error');
      return;
    }
    
    // Verificăm dacă codul promoțional începe cu "POPOTA"
    if (promoCode.startsWith('POPOTA')) {
      // Verificăm dacă un cod a fost deja aplicat la această comandă
      if (appliedPromoCode) {
        showNotification('Ai aplicat deja un cod promoțional la această comandă.', 'error');
        return;
      }
      
      try {
        // Verificăm dacă utilizatorul a mai folosit coduri promoționale în trecut
        const response = await axios.get(`${url}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success && response.data.user) {
          const userCodes = response.data.user.usedPromoCodes || [];
          
          // Dacă utilizatorul a folosit deja vreun cod, nu mai poate folosi altul
          if (userCodes.length > 0) {
            showNotification('Ai folosit deja un cod promoțional în trecut. Fiecare utilizator poate folosi doar un singur cod.', 'error');
            return;
          }
          
          // Aplicăm o reducere de 15%
          const discountAmount = subtotal * 0.15;
          setDiscount(discountAmount);
          setAppliedPromoCode(promoCode);
          
          // Salvăm codul promoțional și discount-ul în localStorage
          localStorage.setItem('promoCode', promoCode);
          localStorage.setItem('discount', discountAmount.toString());
          
          showNotification('Codul promoțional a fost aplicat cu succes! Ai primit 15% reducere.', 'success');
        }
      } catch (error) {
        console.error('Eroare la verificarea codurilor promoționale utilizate:', error);
        showNotification('A apărut o eroare la verificarea codului promoțional.', 'error');
      }
    } else {
      showNotification('Cod promoțional invalid.', 'error');
    }
  };
  
  // Funcție pentru a elimina codul promoțional
  const removePromoCode = () => {
    setDiscount(0);
    setAppliedPromoCode(null);
    setPromoCode('');
    
    // Ștergem codul promoțional și discount-ul din localStorage
    localStorage.removeItem('promoCode');
    localStorage.removeItem('discount');
    
    showNotification('Codul promoțional a fost eliminat.', 'success');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verifică dacă datele sunt încărcate și coșul nu este gol
    if (!isDataLoaded) {
      showNotification('Se încarcă datele, te rugăm să aștepți...', 'error');
      return;
    }
    
    // Verifică dacă coșul este gol
    if (Object.keys(cartItems).length === 0 || subtotal === 0) {
      showNotification('Coșul este gol! Adaugă produse înainte de a plasa o comandă.', 'error');
      return;
    }

    // Validăm datele din formular
    for (const field in formData) {
      if (!formData[field]) {
        showNotification(`Câmpul ${field} este obligatoriu`, 'error');
        return;
      }
    }

    if (!token) {
      showNotification('Trebuie să fii autentificat pentru a plasa o comandă', 'error');
      return;
    }

    try {
      setIsSubmitting(true);

      // Pregătim itemele pentru comandă
      const orderItems = Object.keys(cartItems)
        .filter(key => cartItems[key] > 0)
        .map(cartItemKey => {
          const product = getProduct(cartItemKey);
          
          // Verificăm dacă produsul există
          if (!product) {
            return null;
          }
          
          const options = productOptions[cartItemKey] || {};
          const itemPrice = calculateItemPrice(product, options);
          
          return {
            productId: getProductId(cartItemKey),
            name: product.name,
            price: itemPrice,
            quantity: cartItems[cartItemKey],
            options,
            totalPrice: itemPrice * cartItems[cartItemKey]
          };
        })
        .filter(item => item !== null); // Filtrăm itemele null

      // Creăm datele comenzii
      const orderData = {
        items: orderItems,
        deliveryInfo: formData,
        subtotal,
        discount,
        deliveryFee,
        total,
        promoCodeApplied: appliedPromoCode,
      };

      console.log('Datele comenzii trimise:', orderData);
      
      // Trimitem comanda către server
      const response = await axios.post(
        `${url}/api/orders/create`,
        orderData,
        { headers: { token } }
      );

      if (response.data.success) {
        try {
          // Golim și coșul de pe server
          await axios.post(`${url}/api/cart/clear`, {}, { headers: { token } });
          
          // Golim coșul local și codul promoțional folosind funcția din context
          clearCartLocally();
          
          showNotification('Comanda a fost plasată cu succes!', 'success');
          
          // Redirecționăm către pagina de succes
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } catch (clearError) {
          console.error('Eroare la golirea coșului:', clearError);
          // Golim totuși coșul local și ștergem codul promoțional
          clearCartLocally();
          navigate('/');
        }
      }
      
    } catch (error) {
      console.error('Eroare la plasarea comenzii:', error);
      showNotification('A apărut o eroare la plasarea comenzii. Te rugăm să încerci din nou.', 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <form className='place-order' onSubmit={handleSubmit}>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>

        <div className="multi-fields">
          <input 
            type="text" 
            name="firstName" 
            placeholder='FirstName' 
            value={formData.firstName} 
            onChange={handleChange} 
            required 
          />
          <input 
            type="text" 
            name="lastName" 
            placeholder='LastName' 
            value={formData.lastName} 
            onChange={handleChange} 
            required 
          />
        </div>

        <input 
          type="email" 
          name="email" 
          placeholder='Email adress' 
          value={formData.email} 
          onChange={handleChange} 
          required 
        />
        <input 
          type="text" 
          name="street" 
          placeholder='Street' 
          value={formData.street} 
          onChange={handleChange} 
          required 
        />

        <div className="multi-fields">
          <input 
            type="text" 
            name="city" 
            placeholder='City' 
            value={formData.city} 
            onChange={handleChange} 
            required 
          />
          <input 
            type="text" 
            name="state" 
            placeholder='State' 
            value={formData.state} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="multi-fields">
          <input 
            type="text" 
            name="zipCode" 
            placeholder='Zip Code' 
            value={formData.zipCode} 
            onChange={handleChange} 
            required 
          />
          <input 
            type="text" 
            name="country" 
            placeholder='Country' 
            value={formData.country} 
            onChange={handleChange} 
            required 
          />
        </div>

        <input 
          type="text" 
          name="phone" 
          placeholder='Phone' 
          value={formData.phone} 
          onChange={handleChange} 
          required 
        />

      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>

          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>{subtotal.toFixed(2)} RON</p>
            </div>
            <hr />

            {discount > 0 && (
              <>
                <div className="cart-total-details discount">
                  <p>Discount (15%)</p>
                  <p>-{discount.toFixed(2)} RON</p>
                </div>
                <hr />
              </>
            )}

            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>{deliveryFee.toFixed(2)} RON</p>
            </div>
            <hr />

            <div className="cart-total-details">
              <b>Total</b>
              <b>{total.toFixed(2)} RON</b>
            </div>
          </div>
          
          {/* Secțiunea pentru cod promoțional */}
          <div className="promocode-section">
            <p>Ai un cod promoțional?</p>
            <div className="promocode-input">
              <input 
                type="text" 
                placeholder="Cod promoțional" 
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                disabled={appliedPromoCode !== null}
              />
              {appliedPromoCode ? (
                <button type="button" onClick={removePromoCode} className="remove-promo">Elimină</button>
              ) : (
                <button type="button" onClick={applyPromoCode}>Aplică</button>
              )}
            </div>
            {appliedPromoCode && (
              <div className="applied-promo">
                <p>Aplicat: <span>{appliedPromoCode}</span></p>
              </div>
            )}
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Se procesează...' : 'Finalizează Comanda'}
          </button>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder
