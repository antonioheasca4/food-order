import foodModel from "../models/foodModel.js";

const product = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await foodModel.findById(productId);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produsul nu a fost găsit' });
    }
    
    // Asigură-te că opțiunile sunt incluse în răspuns
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

export {product}