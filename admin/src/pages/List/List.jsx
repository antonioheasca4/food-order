import React, { useEffect, useState } from 'react'
import './List.css'
import axios from "axios"
import {toast} from "react-toastify"

const List = ({url}) => {

  const [list,setList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      console.log("Răspunsul de la server pentru lista de produse:", response.data);
      
      if(response.data.succes){
        setList(response.data.data);
      } else {
        toast.error("Nu s-au putut încărca produsele");
      }
    } catch (error) {
      console.error("Eroare la încărcarea listei de produse:", error);
      toast.error("Eroare la comunicarea cu serverul");
    } finally {
      setIsLoading(false);
    }
  }

  const removeFood = async (foodId) => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await axios.post(
        `${url}/api/food/remove`, 
        { id: foodId }, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if(response.data.succes) {
        toast.success(response.data.message);
        // Actualizăm lista după ștergere
        await fetchList();
      } else {
        toast.error(response.data.message || "Nu s-a putut șterge produsul");
      }
    } catch (error) {
      console.error("Eroare la ștergerea produsului:", error);
      toast.error("Eroare la comunicarea cu serverul");
    }
  }

  useEffect(() => {
    fetchList();
  }, []);

  if (isLoading) {
    return <div className="loading">Se încarcă lista de produse...</div>;
  }

  if (list.length === 0) {
    return <div className="no-items">Nu există produse în sistem.</div>;
  }

  return (
    <div className="list">
      <p>All Foods List</p>

      <table className="food-list-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {list.map((item, index) => (
            <tr key={index}>
              <td>
                <img 
                  src={`${url}/images/${item.image}`} 
                  alt={item.name} 
                  className="food-item-image"
                />
              </td>
              <td>{item.name}</td>
              <td>{item.category}</td>
              <td>{item.price} RON</td>
              <td>
                <button 
                  className="remove-button"
                  onClick={() => removeFood(item._id)}
                  aria-label="Șterge produs"
                >
                  X
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default List