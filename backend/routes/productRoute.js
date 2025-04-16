import express from 'express';
import foodModel from '../models/foodModel.js';
import {product} from "../controllers/productController.js"

const productRouter = express.Router();

productRouter.get('/:id', product);


export default productRouter;