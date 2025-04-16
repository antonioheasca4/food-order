import reviewModel from "../models/reviewModel.js";
import userModel from "../models/userModel.js";

// Obține toate recenziile pentru un produs
export const getProductReviews = async (req, res) => {
  try {
    const productId = req.params.productId;
    const reviews = await reviewModel.find({ productId }).sort({ date: -1 });
    
    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Eroare la obținerea recenziilor:', error);
    res.status(500).json({ success: false, message: 'Eroare de server' });
  }
};

// Adaugă o recenzie
export const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;
    
    // Verifică dacă utilizatorul a mai adăugat o recenzie pentru acest produs
    const existingReview = await reviewModel.findOne({ productId, userId });
    
    if (existingReview) {
      // Actualizează recenzia existentă
      existingReview.rating = rating;
      existingReview.comment = comment;
      existingReview.date = Date.now();
      
      await existingReview.save();
      
      return res.json({ 
        success: true, 
        message: 'Recenzia a fost actualizată cu succes',
        data: existingReview
      });
    }
    
    // Obține numele utilizatorului
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilizatorul nu a fost găsit' });
    }
    
    // Creează o nouă recenzie
    const newReview = new reviewModel({
      productId,
      userId,
      userName: user.name,
      rating,
      comment
    });
    
    await newReview.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Recenzia a fost adăugată cu succes',
      data: newReview
    });
  } catch (error) {
    console.error('Eroare la adăugarea recenziei:', error);
    
    // Verifică dacă este o eroare de duplicat (utilizatorul a încercat să adauge mai multe recenzii)
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ați adăugat deja o recenzie pentru acest produs' 
      });
    }
    
    res.status(500).json({ success: false, message: 'Eroare de server' });
  }
};

// Șterge o recenzie
export const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const userId = req.user.id;
    
    const review = await reviewModel.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Recenzia nu a fost găsită' });
    }
    
    // Verifică dacă utilizatorul este proprietarul recenziei sau admin
    if (review.userId.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Nu aveți permisiunea de a șterge această recenzie' });
    }
    
    await reviewModel.findByIdAndDelete(reviewId);
    
    res.json({ success: true, message: 'Recenzia a fost ștearsă cu succes' });
  } catch (error) {
    console.error('Eroare la ștergerea recenziei:', error);
    res.status(500).json({ success: false, message: 'Eroare de server' });
  }
}; 