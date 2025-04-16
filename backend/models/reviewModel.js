import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'food',
        required: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user',
        required: true 
    },
    userName: { 
        type: String, 
        required: true 
    },
    rating: { 
        type: Number, 
        required: true,
        min: 1,
        max: 5
    },
    comment: { 
        type: String, 
        required: true 
    },
    date: { 
        type: Date, 
        default: Date.now 
    }
});

// Index compus pentru a evita recenzii multiple de la același utilizator pentru același produs
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

const reviewModel = mongoose.models.review || mongoose.model("review", reviewSchema);

export default reviewModel; 