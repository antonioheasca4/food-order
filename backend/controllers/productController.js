// Controller pentru produse
// Exemplu: cauti produse dupa anumite criterii

import foodModel from "../models/foodModel.js";

const product = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await foodModel.findById(productId);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produsul nu a fost găsit' });
    }
    
    // Asigura-te ca optiunile sunt incluse in raspuns
    const response = {
      ...product.toObject(),
      success: true
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// Ia toate produsele care au un anumit ingredient sau criteriu
const getProductsByCriteria = async (req, res) => {
    try {
        // Exemplu: cauta produse dupa categorie
        const { category } = req.query;
        let query = {};
        if (category) {
            query.category = category;
        }
        const products = await foodModel.find(query);
        res.json({ success: true, data: products });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Eroare la cautare produse" });
    }
};

export {product, getProductsByCriteria};