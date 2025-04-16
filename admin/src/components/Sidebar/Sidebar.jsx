import React from 'react'
import './Sidebar.css'
import { assets } from '../../assets/assets'

const Sidebar = ({ currentPage, onPageChange }) => {
  return (
    <div className='sidebar'>
      <div className="sidebar-options">
        <div 
          className={`sidebar-option ${currentPage === 'add' ? 'active' : ''}`}
          onClick={() => onPageChange('add')}
        >
          <img src={assets.add_icon} alt="" />
          <p>Add Items</p>
        </div>
        
        <div 
          className={`sidebar-option ${currentPage === 'products' ? 'active' : ''}`}
          onClick={() => onPageChange('products')}
        >
          <img src={assets.order_icon} alt="" />
          <p>List Items</p>
        </div>
        
        <div 
          className={`sidebar-option ${currentPage === 'dashboard' ? 'active' : ''}`}
          onClick={() => onPageChange('dashboard')}
        >
          <img src={assets.order_icon} alt="" />
          <p>Orders</p>
        </div>

        <div 
          className={`sidebar-option ${currentPage === 'accounts' ? 'active' : ''}`}
          onClick={() => onPageChange('accounts')}
        >
          <img src={assets.order_icon} alt="" />
          <p>Conturi</p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
