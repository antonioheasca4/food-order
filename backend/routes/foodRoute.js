import express from "express"
import { addFood, listFood, getFood, updateFood, removeFood, getCategoryOptions } from "../controllers/foodController.js"
import multer from "multer"

const foodRouter = express.Router();

// Image Storage Engine
const storage = multer.diskStorage({
    destination:"uploads",
    filename:(req,file,cb)=>{
        return cb(null,`${Date.now()}${file.originalname}`)
    }
})

const upload = multer({storage:storage})

foodRouter.post("/add", upload.single("image"), addFood)
foodRouter.get("/list", listFood)
foodRouter.get("/options/:category", getCategoryOptions)
foodRouter.get("/:id", getFood)
foodRouter.patch("/:id", upload.single("image"), updateFood)
foodRouter.post("/remove", removeFood)

export default foodRouter;
