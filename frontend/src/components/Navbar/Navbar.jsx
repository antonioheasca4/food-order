import React, { useContext, useState, useEffect, useRef } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext'
import axios from "axios"
import NavbarSearch from './NavbarSearch.jsx'

const Navbar = ({setShowLogin}) => {

    const [menu,setMenu] = useState("home");
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const profileRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    const {getTotalCartAmount,token,setToken,url,setCartItems } = useContext(StoreContext)

    // Funcția pentru navigare către Home cu scroll la o secțiune specifică
    const navigateToHomeSection = (section) => {
      setMenu(section);
      
      // Verifică dacă utilizatorul este deja pe pagina home
      if (location.pathname === '/') {
        // Scroll la secțiunea specificată dacă suntem deja pe home
        const targetElement = document.getElementById(section === 'menu' ? 'explore-menu' : 
                                                     section === 'mobile-app' ? 'app-download' : null);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // Navigheză către home cu un parametru pentru a indica secțiunea țintă
        navigate('/', { state: { scrollTo: section } });
      }
    };
    
    // Funcția pentru scroll la secțiunea footer (contact)
    const scrollToFooter = () => {
      setMenu("contact us");
      
      // Scroll la footer dacă există
      const footerElement = document.getElementById('footer');
      if (footerElement) {
        footerElement.scrollIntoView({ behavior: 'smooth' });
      }
    };

    // Efect pentru a gestiona clicurile în afara dropdown-ului
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current && 
          !dropdownRef.current.contains(event.target) &&
          profileRef.current &&
          !profileRef.current.contains(event.target)
        ) {
          setShowDropdown(false);
        }
      };
      
      // Adaugă event listener când componenta este montată
      document.addEventListener('mousedown', handleClickOutside);
      
      // Curăță event listener-ul când componenta este demontată
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const toggleDropdown = () => {
      setShowDropdown(!showDropdown);
    };

    const logout = async () => {
      try {
        if (localStorage.getItem("token")) {
          await axios.post(url + "/api/cart/clear", {}, {
            headers: {
              token: localStorage.getItem("token")
            }
          });
        }
        
        setCartItems({});
        localStorage.removeItem("token");
        setToken("");
        setShowDropdown(false); // Închide dropdown-ul
        navigate("/");
      } catch (error) {
        console.error("Error during logout:", error);
        setCartItems({});
        localStorage.removeItem("token");
        setToken("");
        navigate("/");
      }
    };

  return (
    <div className='navbar'>
      <Link to='/' ><img src={assets.logo} alt="" className="logo" /></Link>
      <ul className="navbar-menu">
        <Link to='/' onClick={()=>setMenu("home")} className={menu==="home"?"active":""}>home</Link>
        <a onClick={() => navigateToHomeSection("menu")} className={menu==="menu"?"active":""} style={{cursor: 'pointer'}}>menu</a>
        <a onClick={() => navigateToHomeSection("mobile-app")} className={menu==="mobile-app"?"active":""} style={{cursor: 'pointer'}}>mobile-app</a>
        <a onClick={() => scrollToFooter()} className={menu==="contact us"?"active":""} style={{cursor: 'pointer'}}>contact us</a>
      </ul>
      <div className="navbar-right">

        <div className="navbar-search-icon">
          <NavbarSearch/>
        </div>
        
        <div className="navbar-cart-icon">
            <Link to='/cart' ><img src={assets.basket_icon} alt="" /></Link>
            <div className={getTotalCartAmount()===0?"":"dot"}></div>
        </div>
        {!token?<button onClick={()=>setShowLogin(true)}>sign in</button>
        : <div className='navbar-profile'>
            <img 
              ref={profileRef}
              src={assets.profile_icon} 
              alt="Profil" 
              onClick={toggleDropdown}
            />
            <div 
              ref={dropdownRef}
              className={`nav-profile-dropdown ${showDropdown ? 'show-dropdown' : ''}`}
            >
              <li>
                <Link to="/orders" onClick={() => setShowDropdown(false)}>
                  <img src={assets.bag_icon} alt="" /><p>Comenzile mele</p>
                </Link>
              </li>
              <li>
                <Link to="/settings" onClick={() => setShowDropdown(false)}>
                  <img src={assets.profile_icon} alt="" /><p>Setări cont</p>
                </Link>
              </li>
              <hr />
              <li onClick={logout}><img src={assets.logout_icon} alt="" /><p>Ieșire</p></li>
            </div>
          </div>}
        
      </div>
    </div>
  )
}

export default Navbar
