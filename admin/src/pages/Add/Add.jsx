import React, { useState, useCallback, useEffect } from 'react'
import './Add.css'
import { assets } from '../../assets/assets'
import axios from "axios"
import { toast } from 'react-toastify'

const Add = ({url}) => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    desc: "",
    category: "",
    price: "",
  });

  // Obține toate categoriile disponibile din frontend
  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await axios.get(`${url}/api/food/list`);
        if (response.data.succes) {
          // Extragem categoriile unice
          const uniqueCategories = [...new Set(response.data.data.map(item => item.category))];
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error("Eroare la obținerea categoriilor:", error);
        toast.error("Nu s-au putut încărca categoriile");
      }
    };
    
    getCategories();
  }, [url]);

  // Obține opțiunile pentru categoria selectată
  useEffect(() => {
    const getCategoryOptions = async () => {
      if (!formData.category) return;
      
      try {
        const response = await axios.get(`${url}/api/food/options/${formData.category}`);
        if (response.data.success) {
          setCategoryOptions(response.data.data);
        }
      } catch (error) {
        console.error("Eroare la obținerea opțiunilor pentru categorie:", error);
      }
    };
    
    getCategoryOptions();
  }, [formData.category, url]);

  const onChangeHandler = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    if (images.length === 0) {
      toast.error("Vă rugăm să încărcați o imagine");
      return;
    }

    setIsLoading(true);
    
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.desc);
      data.append("category", formData.category);
      data.append("price", formData.price);
      data.append("image", images[0]);
      
      // Adăugăm opțiunile pentru categorie dacă există
      if (categoryOptions.length > 0) {
        data.append("options", JSON.stringify(categoryOptions));
      }

      const token = localStorage.getItem("auth-token");
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      const response = await axios.post(
        `${url}/api/food/add`,
        data,
        config
      );

      if (response.data.succes) {
        toast.success("Produs adăugat cu succes!");
        setFormData({
          name: "",
          desc: "",
          category: "",
          price: "",
        });
        setImages([]);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Eroare la adăugarea produsului:", error);
      toast.error(error.response?.data?.message || "A apărut o eroare la adăugarea produsului");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='add'>
      <div className='add-form'>
        <p>Adăugare produs nou</p>
        
        <form onSubmit={onSubmitHandler}>
          <div className="form-group">
            <label htmlFor="productImg">Imagine produs</label>
            <input
              id="productImg"
              type="file"
              accept="image/*"
              onChange={(e) => setImages([e.target.files[0]])}
            />
            {images.length > 0 && (
              <div className="image-preview-container">
                <img
                  className="image-preview"
                  src={URL.createObjectURL(images[0])}
                  alt="Preview"
                />
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="name">Nume produs</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Nume produs"
              value={formData.name}
              onChange={onChangeHandler}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="desc">Descriere</label>
            <textarea
              id="desc"
              name="desc"
              placeholder="Descriere produs"
              value={formData.desc}
              onChange={onChangeHandler}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Categorie</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={onChangeHandler}
              required
            >
              <option value="">Selectați categoria</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="price">Preț (RON)</label>
            <input
              id="price"
              type="number"
              name="price"
              placeholder="Preț"
              value={formData.price}
              onChange={onChangeHandler}
              required
            />
          </div>
          
          {categoryOptions.length > 0 && (
            <div className="form-group options-info">
              <label>Opțiuni pentru această categorie</label>
              <div className="options-summary">
                {categoryOptions.map((option, index) => (
                  <div key={index} className="option-group">
                    <strong>{option.name}</strong>: {option.items.length} opțiuni disponibile
                    {option.selectMultiple ? " (selecție multiplă)" : " (selecție unică)"}
                  </div>
                ))}
              </div>
              <p className="options-note">Aceste opțiuni vor fi adăugate automat la produs</p>
            </div>
          )}
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Se adaugă..." : "Adaugă produs"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Add;
