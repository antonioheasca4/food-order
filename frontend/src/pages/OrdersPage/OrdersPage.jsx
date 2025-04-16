import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import './OrdersPage.css';

const OrdersPage = () => {
  const { url, token, showNotification } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificăm dacă utilizatorul este autentificat
    if (!token) {
      showNotification('Trebuie să fii autentificat pentru a vedea comenzile!', 'error');
      navigate('/'); // Redirecționăm către pagina principală
      return;
    }
    
    fetchOrders();
  }, [token]);

  // Aplicăm filtrul de status când se schimbă statusFilter sau orders
  useEffect(() => {
    filterOrdersByStatus();
  }, [statusFilter, orders]);

  const filterOrdersByStatus = () => {
    if (statusFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === statusFilter));
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      
      const response = await axios.get(`${url}/api/orders/myorders`, {
        headers: {
          token: token
        }
      });

      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        showNotification('Nu s-au putut încărca comenzile tale!', 'error');
      }
    } catch (error) {
      console.error("Eroare la încărcarea comenzilor:", error);
      showNotification('Eroare la comunicarea cu serverul!', 'error');
      // Dacă primim eroare 401, înseamnă că token-ul a expirat
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const refreshOrders = () => {
    fetchOrders();
  };

  // Funcție pentru a formata data
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('ro-RO', options);
  };


  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'În așteptare',
      'processing': 'În procesare',
      'shipped': 'Expediată',
      'delivered': 'Livrată',
      'cancelled': 'Anulată'
    };

    return statusMap[status] || status;
  };

  // Funcție pentru a obține clasa CSS pentru status
  const getStatusClass = (status) => {
    return `status-${status}`;
  };

  if (loading && !isRefreshing) {
    return <div className="orders-loading">Se încarcă comenzile tale...</div>;
  }

  if (orders.length === 0 && !loading) {
    return (
      <div className="no-orders">
        <img 
          src="/images/empty-orders.svg" 
          alt="Nicio comandă" 
          className="empty-orders-image"
          onError={(e) => {
            e.target.style.display = 'none'; // Ascundem imaginea dacă nu exista
          }}
        />
        <h2>Nu ai plasat încă nicio comandă</h2>
        <p>Explorează produsele noastre delicioase și plasează prima ta comandă! Te așteaptă o experiență culinară deosebită.</p>
        <button onClick={() => navigate('/')}>
          Vezi produsele
          <span className="button-arrow">→</span>
        </button>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>Comenzile mele</h1>
        
        <div className="orders-controls">
          <div className="filter-controls">
            <label htmlFor="status-filter">Filtrează după status:</label>
            <select 
              id="status-filter" 
              className="status-filter" 
              value={statusFilter} 
              onChange={handleStatusFilterChange}
            >
              <option value="all">Toate comenzile</option>
              <option value="pending">În așteptare</option>
              <option value="processing">În procesare</option>
              <option value="shipped">Expediate</option>
              <option value="delivered">Livrate</option>
              <option value="cancelled">Anulate</option>
            </select>
          </div>
          
          <button 
            className="refresh-button" 
            onClick={refreshOrders}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <div className="no-filtered-orders">
            <p>Nu există comenzi cu statutul selectat.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div>
                  <span className="order-id">Comanda #{order._id.substring(0, 8)}</span>
                  <span className="order-date">  {formatDate(order.createdAt)}</span>
                </div>
                <div className={`order-status ${getStatusClass(order.status)}`}>
                  {getStatusText(order.status)}
                </div>
              </div>
              
              <div className="order-items">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <div className="item-details">
                      <p className="item-name">{item.name}</p>
                      <p className="item-quantity">{item.quantity}x</p>
                    </div>
                    <p className="item-price">{item.totalPrice.toFixed(2)} RON</p>
                  </div>
                ))}
              </div>
              
              <div className="order-footer">
                <div className="order-totals">
                  <div className="subtotal">
                    <span>Subtotal:</span>
                    <span>{order.subtotal.toFixed(2)} RON</span>
                  </div>
                  
                  {order.discount > 0 && (
                    <div className="discount">
                      <span>Discount:</span>
                      <span>-{order.discount.toFixed(2)} RON</span>
                    </div>
                  )}
                  
                  <div className="delivery-fee">
                    <span>Cost livrare:</span>
                    <span>{order.deliveryFee.toFixed(2)} RON</span>
                  </div>
                  
                  <div className="total">
                    <span>Total:</span>
                    <span>{order.total.toFixed(2)} RON</span>
                  </div>
                </div>
                
                <div className="delivery-address">
                  <h4>Adresă livrare:</h4>
                  <p>{order.deliveryInfo.firstName} {order.deliveryInfo.lastName}</p>
                  <p>{order.deliveryInfo.street}</p>
                  <p>{order.deliveryInfo.city}, {order.deliveryInfo.state} {order.deliveryInfo.zipCode}</p>
                  <p>{order.deliveryInfo.country}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrdersPage; 