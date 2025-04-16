import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Orders.css';
import { toast } from 'react-toastify';

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [error, setError] = useState(null);
  
  // State pentru filtrare
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Încercăm să obținem comenzile de la:', `${url}/api/orders/admin/all`);
      
      const token = localStorage.getItem('auth-token');
      
      // Obținem toate comenzile din backend
      const response = await axios.get(`${url}/api/orders/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Răspuns de la server:', response.data);

      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        setError("Nu s-au putut încărca comenzile: " + response.data.message);
        toast.error("Nu s-au putut încărca comenzile!");
      }
    } catch (error) {
      console.error("Eroare la încărcarea comenzilor:", error);
      setError(`Eroare la încărcarea comenzilor: ${error.response?.data?.message || error.message}`);
      toast.error("Eroare la comunicarea cu serverul!");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      
      const response = await axios.patch(
        `${url}/api/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Actualizăm lista de comenzi local
        setOrders(orders.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus } 
            : order
        ));
        toast.success("Status actualizat cu succes!");
      } else {
        toast.error("Nu s-a putut actualiza statusul comenzii!");
      }
    } catch (error) {
      console.error("Eroare la actualizarea statusului:", error);
      toast.error("Eroare la comunicarea cu serverul!");
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderDetails = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  // Filtrare comenzi după status
  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  // Funcție pentru a obține textul statusului în română
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

  // Funcție pentru a formata data
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('ro-RO', options);
  };

  if (loading && orders.length === 0) {
    return <div className="orders-loading">Se încarcă comenzile...</div>;
  }

  if (error) {
    return (
      <div className="orders-error">
        <p>A apărut o eroare la încărcarea comenzilor:</p>
        <p>{error}</p>
        <button onClick={fetchOrders} className="retry-button">Încearcă din nou</button>
      </div>
    );
  }

  if (orders.length === 0) {
    return <div className="no-orders">Nu există comenzi în sistem.</div>;
  }

  return (
    <div className="admin-orders">
      <div className="orders-header">
        <h1>Administrare Comenzi</h1>
        
        <div className="filter-controls">
          <label htmlFor="status-filter">Filtrează după status:</label>
          <select 
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">Toate comenzile</option>
            <option value="pending">În așteptare</option>
            <option value="processing">În procesare</option>
            <option value="shipped">Expediate</option>
            <option value="delivered">Livrate</option>
            <option value="cancelled">Anulate</option>
          </select>
          
          <button 
            onClick={fetchOrders} 
            className="refresh-button"
            disabled={loading}
          >
            {loading ? "Se încarcă..." : "Refresh"}
          </button>
        </div>
      </div>
      
      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <div className="no-filtered-orders">Nu există comenzi cu statusul selectat.</div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order._id} className={`order-item ${expandedOrder === order._id ? 'expanded' : ''}`}>
              <div className="order-header" onClick={() => toggleOrderDetails(order._id)}>
                <div className="order-id">
                  <span>Comanda:</span> #{order._id.substring(0, 8)}
                </div>
                <div className="order-date">
                  <span>Data:</span> {formatDate(order.createdAt)}
                </div>
                <div className="order-customer">
                  <span>Client:</span> {order.deliveryInfo?.firstName} {order.deliveryInfo?.lastName}
                </div>
                <div className="order-total">
                  <span>Total:</span> {order.total.toFixed(2)} RON
                </div>
                <div className={`order-status ${getStatusClass(order.status)}`}>
                  {getStatusText(order.status)}
                </div>
                <div className="expand-icon">
                  {expandedOrder === order._id ? '▲' : '▼'}
                </div>
              </div>
              
              {expandedOrder === order._id && (
                <div className="order-details">
                  <div className="order-section delivery-info">
                    <h3>Informații livrare</h3>
                    <div className="info-grid">
                      <div>
                        <p><strong>Nume:</strong> {order.deliveryInfo.firstName} {order.deliveryInfo.lastName}</p>
                        <p><strong>Email:</strong> {order.deliveryInfo.email}</p>
                        <p><strong>Telefon:</strong> {order.deliveryInfo.phone}</p>
                      </div>
                      <div>
                        <p><strong>Adresă:</strong> {order.deliveryInfo.street}</p>
                        <p><strong>Oraș:</strong> {order.deliveryInfo.city}, {order.deliveryInfo.state} {order.deliveryInfo.zipCode}</p>
                        <p><strong>Țară:</strong> {order.deliveryInfo.country}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="order-section items">
                    <h3>Produse comandate</h3>
                    <table className="items-table">
                      <thead>
                        <tr>
                          <th>Produs</th>
                          <th>Cantitate</th>
                          <th>Preț unitar</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <div className="product-info">
                                <p>{item.name}</p>
                                {item.options && Object.keys(item.options).length > 0 && (
                                  <small className="options-details">
                                    Cu: {Object.entries(item.options)
                                      .map(([key, value]) => 
                                        typeof value === 'object' && value !== null
                                          ? Object.keys(value).filter(k => value[k]).join(', ')
                                          : value.id || value
                                      )
                                      .join('; ')}
                                  </small>
                                )}
                              </div>
                            </td>
                            <td>{item.quantity}x</td>
                            <td>{item.price.toFixed(2)} RON</td>
                            <td>{item.totalPrice.toFixed(2)} RON</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="3" className="totals-label">Subtotal:</td>
                          <td>{order.subtotal.toFixed(2)} RON</td>
                        </tr>
                        {order.discount > 0 && (
                          <tr>
                            <td colSpan="3" className="totals-label">Discount:</td>
                            <td>-{order.discount.toFixed(2)} RON</td>
                          </tr>
                        )}
                        <tr>
                          <td colSpan="3" className="totals-label">Cost livrare:</td>
                          <td>{order.deliveryFee.toFixed(2)} RON</td>
                        </tr>
                        <tr className="grand-total">
                          <td colSpan="3" className="totals-label">Total:</td>
                          <td>{order.total.toFixed(2)} RON</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  
                  <div className="order-section status-management">
                    <h3>Gestionare status</h3>
                    <div className="status-buttons">
                      <button 
                        className={`status-btn pending ${order.status === 'pending' ? 'active' : ''}`}
                        onClick={() => updateOrderStatus(order._id, 'pending')}
                        disabled={order.status === 'pending' || loading}
                      >
                        În așteptare
                      </button>
                      <button 
                        className={`status-btn processing ${order.status === 'processing' ? 'active' : ''}`}
                        onClick={() => updateOrderStatus(order._id, 'processing')}
                        disabled={order.status === 'processing' || loading}
                      >
                        În procesare
                      </button>
                      <button 
                        className={`status-btn shipped ${order.status === 'shipped' ? 'active' : ''}`}
                        onClick={() => updateOrderStatus(order._id, 'shipped')}
                        disabled={order.status === 'shipped' || loading}
                      >
                        Expediată
                      </button>
                      <button 
                        className={`status-btn delivered ${order.status === 'delivered' ? 'active' : ''}`}
                        onClick={() => updateOrderStatus(order._id, 'delivered')}
                        disabled={order.status === 'delivered' || loading}
                      >
                        Livrată
                      </button>
                      <button 
                        className={`status-btn cancelled ${order.status === 'cancelled' ? 'active' : ''}`}
                        onClick={() => updateOrderStatus(order._id, 'cancelled')}
                        disabled={order.status === 'cancelled' || loading}
                      >
                        Anulată
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
