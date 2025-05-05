// Model pentru review-uri, aici bagam parerile userilor despre mancare
// Fiecare review are user, produs, nota, comentariu si data

import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'food',
        required: true // la ce produs e review-ul
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user',
        required: true // cine a dat review-ul
    },
    userName: { 
        type: String, 
        required: true // numele userului care a scris
    },
    rating: { 
        type: Number, 
        required: true,
        min: 1,
        max: 5 // nota de la 1 la 5
    },
    comment: { 
        type: String, 
        required: true // ce a scris userul
    },
    date: { 
        type: Date, 
        default: Date.now // cand a lasat review-ul
    }
});

// Index compus ca sa nu poata da cineva mai multe review-uri la acelasi produs
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

const reviewModel = mongoose.models.review || mongoose.model("review", reviewSchema);

export default reviewModel; 