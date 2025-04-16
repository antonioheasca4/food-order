import React, { useContext, useState } from 'react'
import './Cart.css'
import {StoreContext} from '../../context/StoreContext'
import {useNavigate} from 'react-router-dom';

const Cart = () => {

  const {
    cartItems, 
    food_list, 
    removeFromCart, 
    addToCart, 
    getTotalCartAmount, 
    url, 
    productOptions, 
    getSelectedOptions, 
    getOptionInfo, 
    calculateItemPrice, 
    showNotification,
    promoCode, 
    discount, 
    applyPromoCode, 
    removePromoCode,
    token,
    isDataLoaded
  } = useContext(StoreContext);

  const [localPromoCode, setLocalPromoCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  
  const navigate = useNavigate();
  
  // Funcție pentru a extrage ID-ul produsului din cheie
  const getProductId = (cartItemKey) => {
    if (cartItemKey.includes('_')) {
      return cartItemKey.split('_')[0];
    }
    return cartItemKey;
  };
  
  // Funcție pentru a obține produsul din lista de produse
  const getProduct = (cartItemKey) => {
    const productId = getProductId(cartItemKey);
    
    // Verificare dacă food_list există și are elemente
    if (!food_list || food_list.length === 0) {
      console.error('Lista de produse nu este disponibilă');
      return null;
    }
    
    return food_list.find(item => item._id === productId);
  };
  
  // Funcție pentru a calcula prețul unui item (produs + opțiuni)
  const getItemPrice = (cartItemKey) => {
    const product = getProduct(cartItemKey);
    if (!product) return 0;
    
    const options = productOptions[cartItemKey] || {};
    return calculateItemPrice(product, options);
  };
  
  // Funcție pentru a formata opțiunile pentru afișare
  const renderOptions = (cartItemKey) => {
    const options = productOptions[cartItemKey];
    if (!options || Object.keys(options).length === 0) return null;
    
    const product = getProduct(cartItemKey);
    if (!product) return null;
    
    return (
      <div className="cart-item-options">
        {Object.keys(options).map(optionType => {
          const option = options[optionType];
          
          // Pentru opțiuni multiple (checkbox-uri)
          if (typeof option === 'object' && !option.id) {
            const selectedOptionIds = Object.keys(option).filter(id => option[id]);
            if (selectedOptionIds.length === 0) return null;
            
            // Găsim numele grupului de opțiuni
            let optionGroupName = optionType;
            let optionNames = [];
            let totalPrice = 0;
            
            // Căutăm în opțiunile produsului
            if (product.options && product.options.length > 0) {
              const optionGroup = product.options.find(group => group.type === optionType);
              if (optionGroup) {
                optionGroupName = optionGroup.name;
              }
            }
            
            // Obținem numele și prețurile opțiunilor selectate
            for (const optId of selectedOptionIds) {
              const optInfo = getOptionInfo(product, optionType, optId);
              if (optInfo) {
                optionNames.push(optInfo.name);
                if (optInfo.price) {
                  totalPrice += optInfo.price;
                }
              }
            }
            
            return (
              <div key={optionType} className="option-group">
                <small>{optionGroupName}: {optionNames.join(', ')} {totalPrice > 0 ? `(+${totalPrice} RON)` : ''}</small>
              </div>
            );
          }
          
          // Pentru opțiuni simple (radio)
          if (option.id) {
            const optInfo = getOptionInfo(product, optionType, option.id);
            if (!optInfo) return null;
            
            // Găsim numele grupului de opțiuni
            let optionGroupName = optionType;
            if (product.options && product.options.length > 0) {
              const optionGroup = product.options.find(group => group.type === optionType);
              if (optionGroup) {
                optionGroupName = optionGroup.name;
              }
            }
            
            return (
              <div key={optionType} className="option-item">
                <small>{optionGroupName}: {optInfo.name} {optInfo.price > 0 ? `(+${optInfo.price} RON)` : ''}</small>
              </div>
            );
          }
          
          return null;
        })}
      </div>
    );
  };
  
  // Funcție pentru a formata prețul pentru afișare (2 zecimale)
  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };
  
  // Funcție pentru a verifica dacă putem afișa produsele
  const canDisplayProducts = () => {
    return isDataLoaded && food_list && food_list.length > 0 && Object.keys(cartItems).some(key => cartItems[key] > 0);
  };

  // Calcul subtotal doar dacă datele sunt încărcate
  const subtotal = isDataLoaded ? getTotalCartAmount() : 0;
  // Taxă de livrare doar dacă există produse în coș
  const deliveryFee = subtotal > 0 ? 2 : 0;
  // Total cu discount
  const total = subtotal + deliveryFee - discount;
  
  // Handler pentru aplicarea codului promoțional
  const handleApplyPromoCode = async () => {
    if (!token) {
      showNotification('Trebuie să fii autentificat pentru a folosi coduri promoționale!', 'error');
      return;
    }
    
    if (!localPromoCode.trim()) {
      showNotification('Te rugăm să introduci un cod promoțional.', 'error');
      return;
    }
    
    setIsApplying(true);
    try {
      const success = await applyPromoCode(localPromoCode);
      if (success) {
        setLocalPromoCode('');
      }
    } finally {
      setIsApplying(false);
    }
  };
  
  return (
    <div className='cart' >

      <div className="cart-items">

        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quanity</p>
          <p>Total</p>
          <p>Add</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />

        {isDataLoaded ? (
          Object.keys(cartItems).map((cartItemKey) => {
            if(cartItems[cartItemKey] > 0) {
              const product = getProduct(cartItemKey);
              if (!product) return null;
              
              const itemPrice = getItemPrice(cartItemKey);
              const totalItemPrice = itemPrice * cartItems[cartItemKey];
              
              return (
                <div key={cartItemKey}>
                  <div className='cart-items-title cart-items-item'>
                    <img src={url + "/images/" + product.image} alt="" />
                    <div>
                      <p>{product.name}</p>
                      {renderOptions(cartItemKey)}
                    </div>
                    <p>{formatPrice(itemPrice)} RON</p>
                    <p>{cartItems[cartItemKey]}</p>
                    <p>{formatPrice(totalItemPrice)} RON</p>
                    <p onClick={() => addToCart(getProductId(cartItemKey), productOptions[cartItemKey])} className='cross'>+</p>
                    <p onClick={() => removeFromCart(cartItemKey)} className='cross'>x</p>
                  </div>
                  <hr />
                </div>
              )
            }
            return null;
          })
        ) : (
          <div className="loading-message">Se încarcă produsele din coș...</div>
        )}


      </div>

        <div className="cart-bottom">
          <div className="cart-total">
            <h2>Cart Totals</h2>

            <div>
              <div className="cart-total-details">
                <p>Subtotal</p>
                <p>{formatPrice(subtotal)} RON</p>
              </div>
              <hr />

              {discount > 0 && (
                <>
                  <div className="cart-total-details discount">
                    <p>Discount (15%)</p>
                    <p>-{formatPrice(discount)} RON</p>
                  </div>
                  <hr />
                </>
              )}

              <div className="cart-total-details">
                <p>Delivery Fee</p>
                <p>{formatPrice(deliveryFee)} RON</p>
              </div>
              <hr />

              <div className="cart-total-details">
                <b>Total</b>
                <b>{formatPrice(total)} RON</b>
              </div>

            </div>

            <button onClick={() => {
              if (Object.keys(cartItems).filter(key => cartItems[key] > 0).length === 0) {
                showNotification('Coșul tău este gol. Adaugă produse înainte de a continua.', 'error');
                return;
              }
              navigate('/order');
            }} >PROCEED TO CHECKOUT</button>

          </div>

          <div className="cart-promocode">
            <div>
              <p>If you have a promo code, Enter it here!</p>
              <div className="cart-promocode-input">
                {promoCode ? (
                  <>
                    <input 
                      type="text" 
                      value={promoCode}
                      disabled={true}
                      className="applied-input"
                    />
                    <button onClick={removePromoCode} className="remove-promo">Remove</button>
                  </>
                ) : (
                  <>
                    <input 
                      type="text" 
                      placeholder='promo code' 
                      value={localPromoCode}
                      onChange={(e) => setLocalPromoCode(e.target.value.toUpperCase())}
                      disabled={isApplying}
                    />
                    <button 
                      onClick={handleApplyPromoCode} 
                      disabled={isApplying}
                      className={isApplying ? 'applying' : ''}
                    >
                      {isApplying ? 'Verificare...' : 'Submit'}
                    </button>
                  </>
                )}
              </div>
              {promoCode && (
                <div className="applied-promo">
                  <p>Applied: <span>{promoCode}</span></p>
                </div>
              )}
              {!token && (
                <div className="auth-message">
                  <p>Autentifică-te pentru a putea folosi coduri promoționale!</p>
                </div>
              )}
            </div>
          </div>

        </div>

    </div>
  )
}

export default Cart
