import React, { useRef, useEffect } from 'react'
import './ExploreMenu.css'
import { menu_list } from '../../assets/assets'

const ExploreMenu = ({category,setCategory}) => {
  // Creez o referință pentru secțiunea de meniu
  const menuRef = useRef(null);
  
  // Efect pentru a verifica dacă secțiunea a fost scrollată prin View Menu
  useEffect(() => {
    // Funcție pentru a evidenția secțiunea la scroll
    const highlightMenu = () => {
      if (menuRef.current) {
        // Verific dacă secțiunea este vizibilă în viewport
        const rect = menuRef.current.getBoundingClientRect();
        if (rect.top <= window.innerHeight && rect.bottom >= 0) {
          menuRef.current.classList.add('highlight-menu');
          
          // Stochez referința într-o variabilă pentru siguranță
          const currentRef = menuRef.current;
          
          setTimeout(() => {
            // Verificăm din nou dacă elementul mai există înainte de a accesa classList
            if (currentRef && currentRef.classList) {
              currentRef.classList.remove('highlight-menu');
            }
          }, 1000);
        }
      }
    };
    
    window.addEventListener('scroll', highlightMenu);
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', highlightMenu);
    };
  }, []);
  
  return (
    <div className='explore-menu' id='explore-menu' ref={menuRef}>
      <h1>Meniul Cantinei Regimentare</h1>
      <p className='explore-menu-text'>Alimentația soldaților reinventată. Alege din categoriile de mai jos!</p>
      <div className="explore-menu-list">
        {menu_list.map((item,index)=>{
            return (
                <div onClick={()=>setCategory(prev=>prev===item.menu_name?"All":item.menu_name)} key={index} className='explore-menu-list-item'>
                    <img className={category===item.menu_name?"active":""} src={item.menu_image} alt="" />
                    <p>{item.menu_name}</p>
                </div>
            )
        })}
      </div>
      <hr />
    </div>
  )
}

export default ExploreMenu
