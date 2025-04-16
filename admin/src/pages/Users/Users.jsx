import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Users.css';
import { toast } from 'react-toastify';

const Users = ({ url }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth-token');
      
      // Obținem toți utilizatorii din backend - corectăm ruta de la /api/users/ la /api/user/
      const response = await axios.get(`${url}/api/user/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        setError("Nu s-au putut încărca utilizatorii: " + response.data.message);
        toast.error("Nu s-au putut încărca utilizatorii!");
      }
    } catch (error) {
      console.error("Eroare la încărcarea utilizatorilor:", error);
      setError(`Eroare la încărcarea utilizatorilor: ${error.response?.data?.message || error.message}`);
      toast.error("Eroare la comunicarea cu serverul!");
    } finally {
      setLoading(false);
    }
  };

  // Funcția pentru inițierea procesului de ștergere
  const initiateDelete = (userId) => {
    setConfirmingDelete(userId);
  };

  // Funcția pentru anularea procesului de ștergere
  const cancelDelete = () => {
    setConfirmingDelete(null);
  };

  // Funcția pentru ștergerea efectivă a utilizatorului
  const confirmDelete = async (userId) => {
    try {
      setDeleting(true);
      
      const token = localStorage.getItem('auth-token');
      
      const response = await axios.delete(`${url}/api/user/admin/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setUsers(users.filter(user => user.id !== userId));
        toast.success("Utilizator șters cu succes!");
      } else {
        toast.error(response.data.message || "Eroare la ștergerea utilizatorului");
      }
    } catch (error) {
      console.error("Eroare la ștergerea utilizatorului:", error);
      toast.error(error.response?.data?.message || "Eroare la ștergerea utilizatorului");
    } finally {
      setDeleting(false);
      setConfirmingDelete(null);
    }
  };

  // Filtrăm utilizatorii în funcție de termenul de căutare
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && users.length === 0) {
    return <div className="users-loading">Se încarcă utilizatorii...</div>;
  }

  if (error) {
    return (
      <div className="users-error">
        <p>A apărut o eroare la încărcarea utilizatorilor:</p>
        <p>{error}</p>
        <button onClick={fetchUsers} className="retry-button">Încearcă din nou</button>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="users-header">
        <h1>Administrare Utilizatori</h1>
        
        <div className="search-controls">
          <input 
            type="text" 
            placeholder="Caută utilizatori..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <button 
            onClick={fetchUsers} 
            className="refresh-button"
            disabled={loading}
          >
            {loading ? "Se încarcă..." : "Refresh"}
          </button>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="no-users">Nu există utilizatori care să corespundă criteriilor de căutare.</div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nume</th>
                <th>Email</th>
                <th>Administrator</th>
                <th>Coduri promoționale utilizate</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`admin-status ${user.isAdmin ? 'is-admin' : 'not-admin'}`}>
                      {user.isAdmin ? 'Da' : 'Nu'}
                    </span>
                  </td>
                  <td>
                    {user.usedPromoCodes && user.usedPromoCodes.length > 0 ? (
                      <ul className="promo-code-list">
                        {user.usedPromoCodes.map((code, index) => (
                          <li key={index}>{code}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="no-codes">Niciun cod</span>
                    )}
                  </td>
                  <td>
                    {user.isAdmin ? (
                      <span className="action-disabled">Nu se poate șterge</span>
                    ) : confirmingDelete === user.id ? (
                      <div className="delete-confirmation">
                        <span>Ești sigur?</span>
                        <div className="confirmation-buttons">
                          <button 
                            className="confirm-yes" 
                            onClick={() => confirmDelete(user.id)} 
                            disabled={deleting}
                          >
                            {deleting ? "Se șterge..." : "Da"}
                          </button>
                          <button 
                            className="confirm-no" 
                            onClick={cancelDelete}
                            disabled={deleting}
                          >
                            Nu
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        className="delete-button" 
                        onClick={() => initiateDelete(user.id)}
                      >
                        Șterge cont
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users; 