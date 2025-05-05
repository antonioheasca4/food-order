// Controller pentru review-uri

import reviewModel from "../models/reviewModel.js";
import foodModel from "../models/foodModel.js";
import userModel from "../models/userModel.js";

// Ia toate review-urile pentru un produs
const getReviewsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await reviewModel.find({ productId }).sort({ date: -1 });
        res.json({ success: true, data: reviews });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Eroare la luat review-uri" });
    }
};

// Sterge un review
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        await reviewModel.findByIdAndDelete(reviewId);
        res.json({ success: true, message: "Review sters!" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Eroare la sters review" });
    }
};

// Editeaza un review
const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;
        await reviewModel.findByIdAndUpdate(reviewId, { rating, comment });
        res.json({ success: true, message: "Review editat!" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Eroare la editare review" });
    }
};

// Adauga un review nou
const addReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user.id;
        // Caută numele userului după id
        const user = await userModel.findById(userId);
        const userName = user ? user.name : "Anonim";
        // Caută dacă există deja o recenzie pentru acest user și produs
        let review = await reviewModel.findOne({ productId, userId });
        if (review) {
            // Dacă există, o actualizăm
            review.rating = rating;
            review.comment = comment;
            review.userName = userName;
            review.date = new Date();
            await review.save();
            res.json({ success: true, message: "Review actualizat!", data: review });
        } else {
            // Dacă nu există, creăm una nouă
            const newReview = new reviewModel({ productId, userId, userName, rating, comment });
            await newReview.save();
            res.json({ success: true, message: "Review adaugat!", data: newReview });
        }
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Eroare la adaugare review" });
    }
};

export { addReview, getReviewsByProduct, deleteReview, updateReview }; 