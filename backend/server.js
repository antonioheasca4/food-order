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


// app config
const app = express()
const port = 4000

// middleware
app.use(express.json()) // parse the frontend requests
app.use(cors()) //acces the backend from any frontend

// db connection
connectDB();


// api endpoint
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
}) //http GET method 


app.listen(port,()=>{
    console.log(`Server Started on http://localhost:${port}`)
})

// mongodb+srv://antonioheasca:baterie639@cluster0.20urb.mongodb.net/?
// retryWrites=true&w=majority&appName=Cluster0