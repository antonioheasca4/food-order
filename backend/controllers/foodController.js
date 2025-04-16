import foodModel from "../models/foodModel.js";
import fs from 'fs'


// add food item
const addFood = async (req,res) => {
    
    let image_filename = `${req.file.filename}`;
    
    // Parsăm opțiunile produsului dacă sunt furnizate
    let options = [];
    if (req.body.options) {
        try {
            options = JSON.parse(req.body.options);
        } catch (error) {
            console.error("Eroare la parsarea opțiunilor:", error);
            return res.json({succes:false, message:"Format invalid pentru opțiuni"});
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


// all food list
const listFood = async (req,res) => {
    try {
        const foods = await foodModel.find({});
        res.json({succes:true,data:foods})
    } catch (error) {
        console.log(error)
        res.json({succes:false,message:"Error"})
    }
}

// get food by id
const getFood = async (req,res) => {
    try {
        const food = await foodModel.findById(req.params.id);
        if (!food) {
            return res.status(404).json({succes:false, message:"Produsul nu a fost găsit"});
        }
        res.json({succes:true, data:food});
    } catch (error) {
        console.log(error);
        res.json({succes:false, message:"Error"});
    }
}

// update food item
const updateFood = async (req,res) => {
    try {
        const foodId = req.params.id;
        const food = await foodModel.findById(foodId);
        
        if (!food) {
            return res.status(404).json({succes:false, message:"Produsul nu a fost găsit"});
        }
        
        const updateData = {};
        
        // Actualizăm numele, descrierea, prețul și categoria dacă sunt furnizate
        if (req.body.name) updateData.name = req.body.name;
        if (req.body.description) updateData.description = req.body.description;
        if (req.body.price) updateData.price = req.body.price;
        if (req.body.category) updateData.category = req.body.category;
        
        // Actualizăm imaginea dacă este furnizată
        if (req.file) {
            // Ștergem imaginea veche
            if (food.image) {
                fs.unlink(`uploads/${food.image}`, (err) => {
                    if (err) console.error("Eroare la ștergerea imaginii vechi:", err);
                });
            }
            updateData.image = req.file.filename;
        }
        
        // Actualizăm opțiunile dacă sunt furnizate
        if (req.body.options) {
            try {
                updateData.options = JSON.parse(req.body.options);
            } catch (error) {
                console.error("Eroare la parsarea opțiunilor:", error);
                return res.json({succes:false, message:"Format invalid pentru opțiuni"});
            }
        }
        
        await foodModel.findByIdAndUpdate(foodId, updateData);
        res.json({succes:true, message:"Produs actualizat cu succes"});
    } catch (error) {
        console.log(error);
        res.json({succes:false, message:"Error la actualizarea produsului"});
    }
}

//remove food item
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

// get options for category
const getCategoryOptions = async (req, res) => {
    try {
        const { category } = req.params;
        
        console.log(`Cerere pentru opțiuni pentru categoria: ${category}`);
        
        if (!category) {
            return res.status(400).json({success: false, message: "Categoria este necesară"});
        }
        
        // Obținem toate produsele din această categorie
        const foods = await foodModel.find({ 
            category: { $regex: new RegExp(category, 'i') } 
        });
        
        console.log(`S-au găsit ${foods.length} produse în categoria ${category}`);
        
        if (!foods || foods.length === 0) {
            return res.json({success: true, data: []});
        }
        
        // Combinăm toate opțiunile disponibile pentru această categorie
        const categoryOptions = [];
        const optionsMap = new Map();
        
        foods.forEach(food => {
            if (food.options && food.options.length > 0) {
                console.log(`Produsul ${food.name} are ${food.options.length} opțiuni`);
                food.options.forEach(option => {
                    if (!optionsMap.has(option.type)) {
                        optionsMap.set(option.type, option);
                        categoryOptions.push(option);
                    }
                });
            } else {
                console.log(`Produsul ${food.name} nu are opțiuni definite`);
            }
        });
        
        console.log(`Returnez ${categoryOptions.length} opțiuni pentru categoria ${category}`);
        
        res.json({success: true, data: categoryOptions});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: "Error la obținerea opțiunilor pentru categorie"});
    }
}

export {addFood, listFood, getFood, updateFood, removeFood, getCategoryOptions}