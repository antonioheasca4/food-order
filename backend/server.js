// Aici pornim tot backend-ul, bagam toate rutele si setarile

import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import 'dotenv/config'
import cartRouter from "./routes/cartRoute.js"
import searchRouter from "./routes/searchRoute.js"
import productRouter from './routes/productRoute.js';
import orderRouter from './routes/orderRoute.js';
import reviewRouter from './routes/reviewRoute.js';
import crypto from "crypto";

// app config, aici setam express si portul
const app = express()
const port = 4000

// middleware-uri de baza
app.use(express.json()) // ca sa inteleaga requesturile cu json
app.use(cors()) // sa putem accesa backendul de oriunde

// conectam la baza de date
connectDB();

// Genereaza un secret JWT random la fiecare pornire, ca sa nu ramana nimeni logat dupa restart
process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');

// aici bagam toate rutele API-ului
app.use("/api/food",foodRouter)
app.use("/images",express.static('uploads'))
app.use("/api/user",userRouter)
app.use("/api/cart",cartRouter)
app.use("/api",searchRouter)
app.use('/product', productRouter);
app.use('/api/orders', orderRouter);
app.use('/api/reviews', reviewRouter);

app.get("/",(req,res) => {
    res.send("API Working!")
}) // test rapid sa vezi daca merge

app.listen(port,()=>{
    console.log(`Server Started on http://localhost:${port}`)
})

// aici era stringul de conectare la mongo, nu-l sterge ca poate ai nevoie
// mongodb+srv://antonioheasca:baterie639@cluster0.20urb.mongodb.net/?
// retryWrites=true&w=majority&appName=Cluster0