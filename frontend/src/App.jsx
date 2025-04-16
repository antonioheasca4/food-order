import React, { useState, useContext, useEffect } from 'react'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import Home from './pages/Home/Home'
import Cart from './pages/Cart/Cart'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Footer from './components/Footer/Footer'
import LoginPopup from './components/LoginPopup/LoginPopup'
import ProductPage from './pages/Product/ProductPage'
import Notification from './components/Notification/Notification'
import { StoreContext } from './context/StoreContext'
import OrdersPage from './pages/OrdersPage/OrdersPage'
import Settings from './pages/Settings/Settings'
import axios from 'axios'

const App = () => {
  const [showLogin, setShowLogin] = useState(false)
  const { notification, closeNotification, token, setToken, url } = useContext(StoreContext)
  const [isVerifying, setIsVerifying] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  // Efect pentru a face scroll la începutul paginii înainte ca pagina să fie redată
  useEffect(() => {
    // Resetează poziția scroll-ului la început instantaneu
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [location.pathname]);

  // Verifică dacă token-ul este valid la încărcarea aplicației
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('token')
      
      if (storedToken) {
        try {
          // Încearcă să obții datele utilizatorului - o cerere simplă pentru a verifica validitatea token-ului
          const response = await axios.get(`${url}/api/orders/myorders`, {
            headers: {
              Authorization: `Bearer ${storedToken}`
            }
          })
          
          if (response.status === 200) {
            setToken(storedToken)
          } else {
            // Token-ul nu este valid, îl ștergem
            localStorage.removeItem('token')
            setToken(null)
          }
        } catch (error) {
          console.error('Eroare la verificarea token-ului:', error)
          // Dacă primim eroare, presupunem că token-ul este invalid
          localStorage.removeItem('token')
          setToken(null)
        }
      }
      
      setIsVerifying(false)
    }
    
    verifyToken()
  }, [])
  
  // Dacă încă verificăm token-ul, afișăm un indicator de încărcare simplu
  if (isVerifying) {
    return <div className="app-loading">Se încarcă aplicația...</div>
  }

  return (
    <>
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : <></>}
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          duration={notification.duration} 
          onClose={closeNotification}
        />
      )}
      <div className='app'>
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/order' element={<PlaceOrder />} />
          <Route path='/product/:productId' element={<ProductPage />} />
          <Route path='/orders' element={<OrdersPage />} />
          <Route path='/settings' element={<Settings />} />
        </Routes>
      </div>
      <Footer />
    </>
  )
    
}

export default App
