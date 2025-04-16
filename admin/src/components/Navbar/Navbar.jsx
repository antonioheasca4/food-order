import React from 'react'
import './Navbar.css'
import {assets} from "../../assets/assets.js"

const Navbar = ({ onLogout }) => {
  return (
    <div className='navbar'>
      <div className="navbar-logo">
        <img className='logo' src={assets.logo} alt="Logo Popota ATM" />
      </div>
      
      <div className="nav-controls">
        <div className="profile-container">
          <img className='profile' src={assets.profile_image} alt="Profil Administrator" />
        </div>
        <button className="logout-btn" onClick={onLogout}>
          Deconectare
        </button>
      </div>
    </div>
  )
}

export default Navbar
