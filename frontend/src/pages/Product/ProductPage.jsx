import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';
import './ProductPage.css';
import ReviewSection from '../../components/ReviewSection/ReviewSection';

const ProductPage = () => {
  const { productId } = useParams(); // Extrage id-ul din URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [productOptions, setProductOptions] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [validationError, setValidationError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const { url, addToCart, getProductOptions, getProductOptionsData, showNotification } = useContext(StoreContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${url}/product/${productId}`);
        
        // Verificăm dacă răspunsul are un format nou sau vechi
        const productData = response.data.data || response.data;
        setProduct(productData);
        
        console.log("Product data:", productData); // Pentru debugging
        
        // Inițializăm prețul total cu prețul produsului
        if (productData && productData.price) {
          setTotalPrice(productData.price);
        }
        
        // Încărcăm opțiunile pentru produs
        if (productData) {
          await loadProductOptions(productData);
        }
      } catch (error) {
        console.error('Eroare la încărcarea produsului:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, url]);
  
  // Efect pentru calcularea prețului total când se schimbă opțiunile
  useEffect(() => {
    if (!product) return;
    
    let price = product.price;
    
    // Adaugă prețurile opțiunilor selectate
    Object.keys(selectedOptions).forEach(optionType => {
      const option = selectedOptions[optionType];
      
      // Pentru opțiuni multiple (checkbox-uri)
      if (typeof option === 'object' && !option.id) {
        Object.keys(option).forEach(optId => {
          if (option[optId]) {
            // Găsim prețul opțiunii
            const optionGroup = productOptions.find(group => group.type === optionType);
            if (optionGroup) {
              const optItem = optionGroup.items.find(item => item.id === optId);
              if (optItem && optItem.price) {
                price += optItem.price;
              }
            }
          }
        });
      } 
      // Pentru opțiuni simple (radio)
      else if (option.id) {
        // Găsim prețul opțiunii
        const optionGroup = productOptions.find(group => group.type === optionType);
        if (optionGroup) {
          const optItem = optionGroup.items.find(item => item.id === option.id);
          if (optItem && optItem.price) {
            price += optItem.price;
          }
        }
      }
    });
    
    setTotalPrice(price);
    
    // Resetăm erorile de validare când se modifică opțiunile
    validateOptions();
  }, [selectedOptions, product, productOptions]);

  // Funcție pentru validarea opțiunilor
  const validateOptions = () => {
    if (!productOptions || productOptions.length === 0) {
      setValidationErrors({});
      setValidationError('');
      return true;
    }

    const errors = {};
    let hasErrors = false;

    // Verificăm fiecare grup de opțiuni de tip radio (non-multiple)
    productOptions.forEach(group => {
      if (!group.selectMultiple) {
        // Dacă nu e selectată nicio opțiune pentru acest grup
        if (!selectedOptions[group.type] || !selectedOptions[group.type].id) {
          errors[group.type] = `Selectați opțiunea pentru ${group.name}`;
          hasErrors = true;
        }
      }
    });

    setValidationErrors(errors);
    setValidationError(hasErrors ? 'Selectați toate opțiunile obligatorii înainte de a adăuga produsul în coș.' : '');
    return !hasErrors;
  };

  // Funcție pentru a încărca opțiunile pentru produs
  const loadProductOptions = async (productData) => {
    try {
      console.log("Încărcare opțiuni pentru:", productData.name); // Pentru debugging
      
      // Verificăm mai întâi dacă produsul are opțiuni în sine
      if (productData.options && productData.options.length > 0) {
        console.log("Produsul are opțiuni definite:", productData.options); // Pentru debugging
        setProductOptions(productData.options);
        return;
      }
      
      // Altfel, încercăm să obținem opțiunile de la server
      try {
        const response = await axios.get(`${url}/api/food/options/${productData.category}`);
        console.log("Răspuns opțiuni de la server:", response.data); // Pentru debugging
        
        if (response.data.success && response.data.data && response.data.data.length > 0) {
          setProductOptions(response.data.data);
          return;
        }
      } catch (error) {
        console.error("Eroare la obținerea opțiunilor de la server:", error);
      }
      
      // Dacă nu există opțiuni în produs sau pe server, folosim datele de test
      const fallbackOptions = getProductOptionsData(productData);
      console.log("Folosim opțiuni de rezervă:", fallbackOptions); // Pentru debugging
      
      if (fallbackOptions) {
        setProductOptions(fallbackOptions);
      } else {
        console.warn("Nu s-au găsit opțiuni pentru produsul:", productData.name);
        setProductOptions([]);
      }
    } catch (error) {
      console.error('Eroare la încărcarea opțiunilor:', error);
      setProductOptions([]);
    }
  };

  const handleOptionChange = (optionType, option) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionType]: option
    }));
    
    // Resetăm eroarea pentru acest tip de opțiune când utilizatorul face o selecție
    setValidationErrors(prev => ({
      ...prev,
      [optionType]: undefined
    }));
  };

  const handleAddToCart = () => {
    // Validăm opțiunile înainte de a adăuga în coș
    if (validateOptions()) {
      addToCart(product._id, selectedOptions);
    } else {
      // Afișăm notificare de eroare
      showNotification(validationError, 'error');
    }
  };

  const renderProductOptions = () => {
    if (!productOptions || productOptions.length === 0) {
      return null;
    }

    return (
      <div className="product-options">
        <h3>Opțiuni disponibile</h3>
        {productOptions.map((optionGroup) => (
          <div 
            key={optionGroup.type} 
            className={`option-group ${validationErrors[optionGroup.type] ? 'option-group-error' : ''}`}
          >
            <h4>
              {optionGroup.name} 
              {!optionGroup.selectMultiple && <span className="required-option">*</span>}
            </h4>
            
            {validationErrors[optionGroup.type] && (
              <div className="option-error-message">{validationErrors[optionGroup.type]}</div>
            )}
            
            <div className="options-list">
              {optionGroup.items.map((option) => (
                <div key={option.id} className="option-item">
                  <label>
                    <input
                      type={optionGroup.selectMultiple ? "checkbox" : "radio"}
                      name={optionGroup.type}
                      checked={
                        optionGroup.selectMultiple
                          ? selectedOptions[optionGroup.type]?.[option.id]
                          : selectedOptions[optionGroup.type]?.id === option.id
                      }
                      onChange={() => {
                        if (optionGroup.selectMultiple) {
                          setSelectedOptions(prev => ({
                            ...prev,
                            [optionGroup.type]: {
                              ...(prev[optionGroup.type] || {}),
                              [option.id]: !prev[optionGroup.type]?.[option.id]
                            }
                          }));
                        } else {
                          handleOptionChange(optionGroup.type, option);
                        }
                      }}
                    />
                    {option.name} {option.price > 0 ? `(+${option.price} RON)` : ''}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Se încarcă...</div>;
  }

  if (!product) {
    return <div className="error">Produsul nu a fost găsit</div>;
  }

  return (
    <div className="product-page-container">
      <div className="product-page">
        <div className="product-image">
          <img src={`${url}/images/${product.image}`} alt={product.name} />
        </div>
        <div className="product-details">
          <h1>{product.name}</h1>
          <p className="product-price">
            {totalPrice} RON
            {totalPrice !== product.price && (
              <span className="base-price"> (Preț de bază: {product.price} RON)</span>
            )}
          </p>
          <p className="product-description">{product.description}</p>
          <div className="product-category">Categorie: {product.category}</div>
          
          {renderProductOptions()}
          
          {validationError && (
            <div className="product-validation-error">{validationError}</div>
          )}
          
          <button 
            className="add-to-cart-button"
            onClick={handleAddToCart}
          >
            Adaugă în coș - {totalPrice} RON
          </button>
        </div>
      </div>
      
      {/* Secțiunea de recenzii */}
      <div className="product-reviews">
        <ReviewSection productId={productId} />
      </div>
    </div>
  );
};

export default ProductPage;