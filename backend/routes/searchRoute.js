import search from './../controllers/searchController.js'
import express from "express"

const searchRouter = express.Router();

searchRouter.get('/search',search);

export default searchRouter
