import express from 'express';
import { getReviewsByProduct, addReview, deleteReview } from '../controllers/reviewController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const reviewRouter = express.Router();

// Obtine toate recenziile pentru un produs
reviewRouter.get('/product/:productId', getReviewsByProduct);

// Adauga o recenzie (necesita autentificare)
reviewRouter.post('/', verifyToken, addReview);

// Sterge o recenzie (necesita autentificare)
reviewRouter.delete('/:reviewId', verifyToken, deleteReview);

export default reviewRouter; 