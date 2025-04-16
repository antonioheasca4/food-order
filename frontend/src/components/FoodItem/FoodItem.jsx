import React from 'react'
import './FoodItem.css'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'

const FoodItem = ({id,name,price,description,image,url}) => {

  return (
    <Link to={`/product/${id}`} className="food-item-link">
      <div className='food-item'>
        <div className="food-item-img-container">
          <img className='food-item-image' src={url + "/images/" + image} alt={name} />
          <div className="view-details-overlay">
            <span>Vezi detalii</span>
          </div>
        </div>
        <div className="food-item-info">
          <div className="food-item-name-rating">
              <p>{name}</p>
              <img src={assets.rating_starts} alt="" />
          </div>
          <p className="food-item-desc">{description}</p>
          <p className="food-item-price">{price} RON</p>
        </div>
      </div>
    </Link>
  )
}

export default FoodItem
