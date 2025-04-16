import React, { useState, useContext, useEffect } from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'

const Footer = () => {
  const [promoCode, setPromoCode] = useState('');
  const [showPromoCode, setShowPromoCode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  
  const { token, usedPromoCodes, showNotification, url } = useContext(StoreContext);

  // Obține emailul utilizatorului când este autentificat
  useEffect(() => {
    const getUserEmail = async () => {
      if (token) {
        try {
          const response = await axios.get(`${url}/api/user/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data.success && response.data.user) {
            setUserEmail(response.data.user.email);
          }
        } catch (error) {
          console.error("Eroare la obținerea datelor utilizatorului:", error);
        }
      }
    };
    
    getUserEmail();
  }, [token, url]);

  const generatePromoCode = () => {
    if (!userEmail) return '';
    
    // Generăm un cod promoțional unic bazat pe emailul utilizatorului
    const timestamp = new Date().getTime().toString().slice(-6);
    const emailPrefix = userEmail.split('@')[0].slice(0, 4).toUpperCase();
    return `POPOTA${emailPrefix}${timestamp}`;
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    // Verificăm dacă utilizatorul este autentificat
    if (!token) {
      setErrorMessage('Trebuie să fii autentificat pentru a genera un cod promoțional.');
      return;
    }
    
    setIsGenerating(true);
    setErrorMessage('');
    
    try {
      // Verificăm dacă utilizatorul a mai folosit coduri promoționale
      if (usedPromoCodes && usedPromoCodes.length > 0) {
        setErrorMessage('Ai folosit deja un cod promoțional. Fiecare utilizator poate folosi doar un singur cod.');
        setShowPromoCode(false);
        return;
      }
      
      // Generăm codul promoțional
      const newPromoCode = generatePromoCode();
      setPromoCode(newPromoCode);
      setShowPromoCode(true);
      
      // Resetăm codul după 15 secunde
      setTimeout(() => {
        setShowPromoCode(false);
      }, 15000);
    } catch (error) {
      setErrorMessage('A apărut o eroare la generarea codului promoțional.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPromoCode = () => {
    navigator.clipboard.writeText(promoCode);
    showNotification('Codul promoțional a fost copiat în clipboard!', 'success');
  };

  const handleFooterLinkClick = (linkName) => {
    setPopupMessage(`Se lucrează la funcționalitatea: ${linkName}. Va fi disponibilă în curând!`);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className='footer' id='footer'>
      <div className="footer-content">
        <div className="footer-content-left">
          <img src={assets.logo} alt="" />
          <p>Popota ATM aduce bucuria unei mese autentice în stil militar, dar cu gusturi rafinate. Echipa noastră de bucătari a transformat rețetele clasice de cantină în preparate delicioase care îți vor cuceri papilele gustative fără niciun ordin!</p>
          <div className="footer-social-icons">
            <img src={assets.facebook_icon} alt="" onClick={() => handleFooterLinkClick('Facebook')} style={{ cursor: 'pointer' }} />
            <img src={assets.twitter_icon} alt="" onClick={() => handleFooterLinkClick('Twitter')} style={{ cursor: 'pointer' }} />
            <img src={assets.instagram_icon} alt="" onClick={() => handleFooterLinkClick('Instagram')} style={{ cursor: 'pointer' }} />
            <img src={assets.youtube_icon} alt="" onClick={() => handleFooterLinkClick('YouTube')} style={{ cursor: 'pointer' }} />
          </div>
        </div>
        <div className="footer-content-center">
          <h2>COMPANY</h2>
          <ul>
            <li onClick={() => handleFooterLinkClick('Home')} style={{ cursor: 'pointer' }}>Home</li>
            <li onClick={() => handleFooterLinkClick('About us')} style={{ cursor: 'pointer' }}>About us</li>
            <li onClick={() => handleFooterLinkClick('Work with us')} style={{ cursor: 'pointer' }}>Work with us</li>
            <li onClick={() => handleFooterLinkClick('Our restaurants')} style={{ cursor: 'pointer' }}>Our restaurants</li>
            <li onClick={() => handleFooterLinkClick('Our responsibility')} style={{ cursor: 'pointer' }}>Our responsibility</li>
          </ul>
        </div>
        <div className="footer-content-right">
          <h2>CONTACT US</h2>
          <ul>
            <li onClick={() => handleFooterLinkClick('Support Email')} style={{ cursor: 'pointer' }}>@: support@popotaatm.com</li>
            <li onClick={() => handleFooterLinkClick('Telephone')} style={{ cursor: 'pointer' }}>Tel: 123-456-7890</li>
            <li onClick={() => handleFooterLinkClick('Fax')} style={{ cursor: 'pointer' }}>Fax: 123-456-7890</li>
          </ul>
          
          <div className="footer-subscribe">
            <h2>OBȚINE COD PROMOȚIONAL</h2>
            
            {!token ? (
              <div className="promo-login-message">
                Trebuie să fii autentificat pentru a genera un cod promoțional.
              </div>
            ) : (
              <>
                {usedPromoCodes && usedPromoCodes.length > 0 ? (
                  <div className="used-promo-info">
                    Ai folosit deja un cod promoțional. Fiecare utilizator poate folosi doar un singur cod.
                  </div>
                ) : (
                  <div className="promo-generate-section">
                    <p>Ești autentificat ca: <strong>{userEmail}</strong></p>
                    <button 
                      onClick={handleSubscribe}
                      disabled={isGenerating || !userEmail}
                      className={isGenerating ? 'generating' : ''}
                    >
                      {isGenerating ? 'GENERARE...' : 'GENEREAZĂ COD PROMOȚIONAL'}
                    </button>
                    
                    {errorMessage && (
                      <div className="subscribe-message error">
                        {errorMessage}
                      </div>
                    )}
                    
                    {showPromoCode && (
                      <div className="promo-code-container">
                        <h3>Codul tău promoțional:</h3>
                        <div className="promo-code">
                          <span>{promoCode}</span>
                          <button onClick={copyPromoCode} className="copy-button">Copiază</button>
                        </div>
                        <p className="promo-code-info">*Folosește acest cod la checkout pentru 15% reducere la comanda ta.</p>
                        <p className="promo-code-info">*Codul poate fi folosit o singură dată.</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="footer-map-container">
        <h2>LOCAȚIA NOASTRĂ</h2>
        <div className="google-map">
          <iframe 
            src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=Academia+Tehnica+Militara+Ferdinand+I,Bucuresti&zoom=16&language=ro&region=RO`}
            width="100%" 
            height="300" 
            style={{border:0}}
            allowFullScreen={true}
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
        <div className="location-info">
          <div className="location-address">
            <h3>Adresa noastră</h3>
            <p>Bulevardul George Coșbuc 39-49, București 050141</p>
          </div>
          <div className="location-hours">
            <h3>Program</h3>
            <p>Luni-Vineri: 10:00 - 22:00</p>
            <p>Sâmbătă-Duminică: 11:00 - 23:00</p>
          </div>
        </div>
      </div>
      
      <div className="footer-copyright">
        <hr />
        <p>Copyright© 2024 Popota ATM | All rights reserved</p>
      </div>
      
      {showPopup && (
        <div className="footer-popup-overlay" onClick={closePopup}>
          <div className="footer-popup" onClick={(e) => e.stopPropagation()}>
            <button className="footer-popup-close" onClick={closePopup}>&times;</button>
            <p>{popupMessage}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Footer
