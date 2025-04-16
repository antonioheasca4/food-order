import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';
import './Settings.css';

const Settings = () => {
  const { url, token, showNotification } = useContext(StoreContext);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nameEdit, setNameEdit] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [savingName, setSavingName] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  
  const navigate = useNavigate();
  
  // Obținem informațiile utilizatorului la încărcarea paginii
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        showNotification('Trebuie să fii autentificat pentru a accesa setările contului', 'error');
        navigate('/');
        return;
      }
      
      try {
        setLoading(true);
        const response = await axios.get(`${url}/api/user/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          setUserData(response.data.user);
          setNameEdit(response.data.user.name);
        } else {
          showNotification('Nu am putut obține informațiile contului tău', 'error');
          navigate('/');
        }
      } catch (error) {
        console.error('Eroare la obținerea datelor utilizatorului:', error);
        showNotification('Eroare la comunicarea cu serverul', 'error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [token, url, navigate, showNotification]);
  
  // Funcție pentru actualizarea numelui
  const handleUpdateName = async () => {
    if (!nameEdit.trim()) {
      showNotification('Numele nu poate fi gol', 'error');
      return;
    }
    
    if (nameEdit === userData.name) {
      setEditingName(false);
      return;
    }
    
    try {
      setSavingName(true);
      const response = await axios.post(`${url}/api/user/update-name`, 
        { name: nameEdit },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setUserData(response.data.user);
        showNotification('Numele a fost actualizat cu succes', 'success');
        setEditingName(false);
      } else {
        showNotification(response.data.message || 'Eroare la actualizarea numelui', 'error');
      }
    } catch (error) {
      console.error('Eroare la actualizarea numelui:', error);
      showNotification('Eroare la comunicarea cu serverul', 'error');
    } finally {
      setSavingName(false);
    }
  };
  
  // Funcție pentru anularea editării
  const handleCancelEdit = () => {
    setNameEdit(userData.name);
    setEditingName(false);
  };
  
  // Funcție pentru schimbarea parolei
  const handleChangePassword = async () => {
    // Validări pentru parolă
    if (!currentPassword) {
      showNotification('Parola actuală este obligatorie', 'error');
      return;
    }
    
    if (!newPassword) {
      showNotification('Noua parolă este obligatorie', 'error');
      return;
    }
    
    if (newPassword.length < 8) {
      showNotification('Noua parolă trebuie să conțină cel puțin 8 caractere', 'error');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      showNotification('Noua parolă și confirmarea nu se potrivesc', 'error');
      return;
    }
    
    try {
      setChangingPassword(true);
      const response = await axios.post(`${url}/api/user/change-password`, 
        { 
          currentPassword, 
          newPassword 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        // Resetăm câmpurile
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showNotification('Parola a fost schimbată cu succes', 'success');
      } else {
        showNotification(response.data.message || 'Eroare la schimbarea parolei', 'error');
      }
    } catch (error) {
      console.error('Eroare la schimbarea parolei:', error);
      if (error.response && error.response.data) {
        showNotification(error.response.data.message || 'Eroare la comunicarea cu serverul', 'error');
      } else {
        showNotification('Eroare la comunicarea cu serverul', 'error');
      }
    } finally {
      setChangingPassword(false);
    }
  };
  
  // Funcție pentru resetarea formularului de parolă
  const resetPasswordForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };
  
  if (loading) {
    return <div className="settings-loading">Se încarcă setările contului...</div>;
  }
  
  if (!userData) {
    return <div className="settings-error">Nu s-au putut încărca informațiile utilizatorului. Te rugăm să încerci din nou mai târziu.</div>;
  }
  
  return (
    <div className="settings-page">
      <h1>Setările Contului</h1>
      
      <div className="settings-container">
        <div className="settings-section">
          <h2>Informații Profil</h2>
          
          <div className="profile-info">
            <div className="info-item">
              <span className="label">Email:</span>
              <span className="value">{userData.email}</span>
            </div>
            
            <div className="info-item">
              <span className="label">Nume:</span>
              
              {editingName ? (
                <div className="edit-name-container">
                  <input 
                    type="text" 
                    value={nameEdit}
                    onChange={(e) => setNameEdit(e.target.value)}
                    className="name-input"
                  />
                  <div className="edit-buttons">
                    <button 
                      onClick={handleUpdateName}
                      disabled={savingName}
                      className="save-button"
                    >
                      {savingName ? 'Se salvează...' : 'Salvează'}
                    </button>
                    <button 
                      onClick={handleCancelEdit}
                      disabled={savingName}
                      className="cancel-button"
                    >
                      Anulează
                    </button>
                  </div>
                </div>
              ) : (
                <div className="name-display">
                  <span className="value">{userData.name}</span>
                  <button 
                    onClick={() => setEditingName(true)}
                    className="edit-button"
                  >
                    Editează
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="settings-section">
          <h2>Schimbă Parola</h2>
          
          <div className="password-form">
            <div className="form-group">
              <label htmlFor="current-password">Parola actuală</label>
              <input 
                type="password" 
                id="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="new-password">Parola nouă</label>
              <input 
                type="password" 
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirm-password">Confirmă parola nouă</label>
              <input 
                type="password" 
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            
            <div className="password-actions">
              <button 
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="change-password-button"
              >
                {changingPassword ? 'Se schimbă...' : 'Schimbă Parola'}
              </button>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 