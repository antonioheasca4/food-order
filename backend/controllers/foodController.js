// Controller pentru mancare
// Toate functiile lucreaza cu produsele din baza de date

import foodModel from "../models/foodModel.js";
import fs from 'fs'

// Adauga un produs nou
const addFood = async (req,res) => {
    let image_filename = `${req.file.filename}`;
    // Daca primim optiuni, le parsam
    let options = [];
    if (req.body.options) {
        try {
            options = JSON.parse(req.body.options);
        } catch (error) {
            console.error("Eroare la parsarea optiunilor:", error);
            return res.json({succes:false, message:"Format invalid pentru optiuni"});
        }
    }
    const food = new foodModel({
        name:req.body.name,
        description:req.body.description,
        price:req.body.price,
        category:req.body.category,
        image:image_filename,
        options: options
    })
    try{
        await food.save();
        res.json({succes:true,message:"Food Added"})
    } catch (error){
        console.log(error)
        res.json({succes:false,message:"Error"})
    }
}

// Ia toata lista de produse
const listFood = async (req,res) => {
    try {
        const foods = await foodModel.find({});
        res.json({succes:true,data:foods})
    } catch (error) {
        console.log(error)
        res.json({succes:false,message:"Error"})
    }
}

// Ia un produs dupa id
const getFood = async (req,res) => {
    try {
        const food = await foodModel.findById(req.params.id);
        if (!food) {
            return res.status(404).json({succes:false, message:"Produsul nu a fost gasit"});
        }
        res.json({succes:true, data:food});
    } catch (error) {
        console.log(error);
        res.json({succes:false, message:"Error"});
    }
}

// Editeaza un produs
const updateFood = async (req,res) => {
    try {
        const foodId = req.params.id;
        const food = await foodModel.findById(foodId);
        if (!food) {
            return res.status(404).json({succes:false, message:"Produsul nu a fost gasit"});
        }
        const updateData = {};
        // Daca primim date noi, le punem
        if (req.body.name) updateData.name = req.body.name;
        if (req.body.description) updateData.description = req.body.description;
        if (req.body.price) updateData.price = req.body.price;
        if (req.body.category) updateData.category = req.body.category;
        // Daca primim poza noua, o punem si stergem pe cea veche
        if (req.file) {
            if (food.image) {
                fs.unlink(`uploads/${food.image}`, (err) => {
                    if (err) console.error("Eroare la stergerea pozei vechi:", err);
                });
            }
            updateData.image = req.file.filename;
        }
        // Daca primim optiuni noi, le parsam
        if (req.body.options) {
            try {
                updateData.options = JSON.parse(req.body.options);
            } catch (error) {
                console.error("Eroare la parsarea optiunilor:", error);
                return res.json({succes:false, message:"Format invalid pentru optiuni"});
            }
        }
        await foodModel.findByIdAndUpdate(foodId, updateData);
        res.json({succes:true, message:"Produs actualizat!"});
    } catch (error) {
        console.log(error);
        res.json({succes:false, message:"Error la actualizare produs"});
    }
}

// Sterge un produs
const removeFood = async (req,res) => {
    try {
        const food = await foodModel.findById(req.body.id);
        fs.unlink(`uploads/${food.image}`,()=>{})
        await foodModel.findByIdAndDelete(req.body.id);
        res.json({succes:true,message:"Food removed"})
    } catch (error) {
        console.log(error)
        res.json({succes:false,message:"Error"})
    }
}

// Ia optiunile pentru o categorie
const getCategoryOptions = async (req, res) => {
    try {
        const { category } = req.params;
        if (!category) {
            return res.status(400).json({success: false, message: "Categoria e necesara"});
        }
        // Cauta toate produsele din categoria asta
        const foods = await foodModel.find({ 
            category: { $regex: new RegExp(category, 'i') } 
        });
        if (!foods || foods.length === 0) {
            return res.json({success: true, data: []});
        }
        // Combinam toate optiunile din categoria asta
        const categoryOptions = [];
        const optionsMap = new Map();
        foods.forEach(food => {
            if (food.options && food.options.length > 0) {
                food.options.forEach(option => {
                    if (!optionsMap.has(option.type)) {
                        optionsMap.set(option.type, option);
                        categoryOptions.push(option);
                    }
                });
            }
        });
        res.json({success: true, data: categoryOptions});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Error la optiuni categorie"});
    }
}

export {addFood, listFood, getFood, updateFood, removeFood, getCategoryOptions}