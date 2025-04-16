import React, { useState, useEffect } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import AppDownload from '../../components/AppDownload/AppDownload'
import { useLocation } from 'react-router-dom'

const Home = () => {

  const [category,setCategory] = useState("All");
  const location = useLocation();

  // Efect pentru a gestiona scrollul automat când se navighează către Home cu o secțiune specifică
  useEffect(() => {
    if (location.state?.scrollTo) {
      const sectionId = 
        location.state.scrollTo === 'menu' ? 'explore-menu' : 
        location.state.scrollTo === 'mobile-app' ? 'app-download' : 
        location.state.scrollTo === 'contact us' ? 'footer' : null;
        
      if (sectionId) {
        setTimeout(() => {
          const targetElement = document.getElementById(sectionId);
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100); // Un mic delay pentru a asigura redarea completă a paginii
      }
    }
  }, [location.state]);

  return (
    <div>
      <Header/>
      <ExploreMenu category={category} setCategory={setCategory}/>
      <FoodDisplay category={category} />
      <AppDownload/>
    </div>
  )
}

export default Home
