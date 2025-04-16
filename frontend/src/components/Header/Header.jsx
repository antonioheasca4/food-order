import React from 'react'
import './Header.css'

const Header = () => {
  // Funcție pentru a scrolls la secțiunea meniului când se apasă butonul
  const scrollToMenu = () => {
    const menuSection = document.getElementById('explore-menu');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className='header'>
      <div className="header-contents">
        <h2>Gata cu mâncarea din cazarmă!</h2>
        <p>După atâtea zile cu fasole, mazăre și cartofi fierți până la destrămare, e timpul pentru mâncare adevărată. La noi, a trecut cu bine inspecția domnului Piedone. Singura armată de care ne pasă e cea a bucătarilor noștri profesioniști!</p>
        <button onClick={scrollToMenu}>Vezi Meniul</button>
      </div>
    </div>
  )
}

export default Header
