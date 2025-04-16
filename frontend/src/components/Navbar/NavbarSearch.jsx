import React, { useState, useEffect, useRef, useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import './NavbarSearch.css';
import { assets } from '../../assets/assets';
import { Link } from 'react-router-dom';

const NavbarSearch = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const { url } = useContext(StoreContext);
  
  // se inchide caseta de cautare cand se da click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSearch = async (query) => {
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.get(`${url}/api/search?query=${encodeURIComponent(query)}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Eroare la căutare:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // gestionare schimbare text in campul de cautare
  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    //setare timeout a.i. sa nu se faca interogari multiple daca user-ul tasteaza rapid
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
    
    window.searchTimeout = setTimeout(() => {
      handleSearch(query);
    }, 300);
  };
  
  
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  return (
    <div className="navbar-search-container" ref={searchRef}>
      <img 
        src={assets.search_icon} 
        alt="Search"
        onClick={toggleSearch}
      />
      
      {isSearchOpen && (
        <div className="search-dropdown">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Caută produse..."
              value={searchQuery}
              onChange={handleInputChange}
              autoFocus
            />
          </div>
          
          {isLoading && (
            <div className="search-loading">Se încarcă...</div>
          )}
          
          {!isLoading && searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((product) => (
                <Link 
                  key={product._id} 
                  to={`/product/${product._id}`}
                  className="search-result-item"
                  onClick={() => setIsSearchOpen(false)}
                >
                  <div className="search-result-image">
                    <img src={url + "/images/" + product.image} alt={product.name} />
                  </div>
                  <div className="search-result-info">
                    <div className="search-result-name">{product.name}</div>
                    <div className="search-result-price">{product.price} RON</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {!isLoading && searchQuery && searchResults.length === 0 && (
            <div className="no-results">Nu au fost găsite rezultate</div>
          )}
        </div>
      )}
    </div>
  );
};

export default NavbarSearch;