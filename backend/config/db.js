import mongoose from "mongoose";

export const connectDB = async() => {
    await mongoose.connect('mongodb+srv://antonioheasca:wqV7Otzx0mK2yxXy@cluster0.20urb.mongodb.net/food-del').then(() => console.log("DB Connected"));
}
