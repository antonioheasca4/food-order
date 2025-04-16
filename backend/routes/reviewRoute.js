import express from 'express';
import { getProductReviews, addReview, deleteReview } from '../controllers/reviewController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const reviewRouter = express.Router();

// Obține toate recenziile pentru un produs
reviewRouter.get('/product/:productId', getProductReviews);

// Adaugă o recenzie (necesită autentificare)
reviewRouter.post('/', verifyToken, addReview);

// Șterge o recenzie (necesită autentificare)
reviewRouter.delete('/:reviewId', verifyToken, deleteReview);

export default reviewRouter; 