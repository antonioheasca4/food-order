import React, { useState } from 'react';
import axios from 'axios';
import './LoginForm.css';
import { toast } from 'react-toastify';

const LoginForm = ({ url, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Te rugăm să completezi toate câmpurile');
      return;
    }
    
    try {
      setLoading(true);
      
      // Facem cererea de login către backend
      const response = await axios.post(`${url}/api/user/login`, {
        email,
        password
      });
      
      console.log('Răspuns login:', response.data);
      
      if (response.data.succes) {
        // Salvăm token-ul în localStorage
        localStorage.setItem('auth-token', response.data.token);
        
        // Verificăm dacă utilizatorul este admin
        try {
          const userCheck = await axios.get(`${url}/api/orders/admin/all`, {
            headers: {
              Authorization: `Bearer ${response.data.token}`
            }
          });
          
          if (userCheck.data.success) {
            toast.success('Autentificare reușită!');
            onLoginSuccess();
            window.location.reload();
          } else {
            toast.error('Cont fără drepturi de administrator');
            localStorage.removeItem('auth-token');
          }
        } catch (error) {
          toast.error('Cont fără drepturi de administrator');
          localStorage.removeItem('auth-token');
        }
      } else {
        toast.error(response.data.message || 'Autentificare eșuată');
      }
    } catch (error) {
      console.error('Eroare la autentificare:', error);
      toast.error('Eroare la comunicarea cu serverul');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <h2>Autentificare Admin</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Adresa de email"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Parolă</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Parola"
            required
          />
        </div>
        <button 
          type="submit" 
          className="login-button"
          disabled={loading}
        >
          {loading ? 'Se procesează...' : 'Autentificare'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm; 