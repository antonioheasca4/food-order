import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import MainContent from './components/MainContent/MainContent'
import LoginForm from './components/LoginForm/LoginForm'
import Notification from './components/Notification/Notification'

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [notification, setNotification] = useState(null)
  const [notificationTimeout, setNotificationTimeout] = useState(null)
  
  const url = 'http://localhost:4000'

  // Funcție pentru afișarea notificărilor
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

  // Suprascriem toast.success, toast.error, etc. pentru a folosi componenta noastră
  useEffect(() => {
    // Salvăm referințele originale
    const originalSuccess = toast.success;
    const originalError = toast.error;
    const originalInfo = toast.info;
    const originalWarning = toast.warning;
    
    // Suprascriem metodele toast
    toast.success = (message) => showNotification(message, 'success');
    toast.error = (message) => showNotification(message, 'error');
    toast.info = (message) => showNotification(message, 'info');
    toast.warning = (message) => showNotification(message, 'warning');
    
    // Restaurăm metodele originale la cleanup
    return () => {
      toast.success = originalSuccess;
      toast.error = originalError;
      toast.info = originalInfo;
      toast.warning = originalWarning;
    };
  }, []);

  useEffect(() => {
    // Verifică dacă există un token salvat
    const checkToken = async () => {
      const token = localStorage.getItem('auth-token')
      if (!token) {
        setIsLoggedIn(false)
        setIsLoading(false)
        return
      }

      try {
        // Verifică dacă tokenul este valid și utilizatorul are drepturi de admin
        const response = await axios.get(`${url}/api/orders/admin/all`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (response.data.success) {
          setIsLoggedIn(true)
        } else {
          setIsLoggedIn(false)
          localStorage.removeItem('auth-token')
          toast.error('Sesiunea a expirat. Te rugăm să te autentifici din nou.')
        }
      } catch (error) {
        console.error('Eroare la verificarea sesiunii:', error)
        setIsLoggedIn(false)
        localStorage.removeItem('auth-token')
        toast.error('Sesiunea a expirat. Te rugăm să te autentifici din nou.')
      } finally {
        setIsLoading(false)
      }
    }

    checkToken()
  }, [])

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('auth-token')
    setIsLoggedIn(false)
    toast.info('Ai fost deconectat cu succes')
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Se încarcă...</p>
      </div>
    )
  }

  return (
    <div className="App">
      {/* ToastContainer ascuns pentru compatibilitate cu codul existent */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      
      {/* Componenta noastră de notificare personalizată */}
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          duration={notification.duration} 
          onClose={closeNotification}
        />
      )}
      
      {isLoggedIn ? (
        <>
          <Navbar onLogout={handleLogout} />
          <div className="content-container">
            <Sidebar 
              currentPage={currentPage} 
              onPageChange={handlePageChange} 
            />
            <MainContent 
              page={currentPage} 
              apiUrl={url} 
            />
          </div>
        </>
      ) : (
        <LoginForm url={url} onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  )
}

export default App
