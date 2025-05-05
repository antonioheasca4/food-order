// Model pentru mancare, cu optiuni si imagine, ca sa stim ce bagam in baza de date
// Aici e schema pentru fiecare produs, cu tot cu optiunile lui (toppinguri, marimi, etc)
// Imaginea e doar numele fisierului, nu poza in sine
// Optiunile sunt grupate pe tipuri, ca sa nu ne incurcam

import mongoose from "mongoose";

const optionItemSchema = new mongoose.Schema({
    id: {type: String, required: true}, // id unic pentru fiecare optiune, gen "cheese"
    name: {type: String, required: true}, // denumirea optiunii, ce vede userul
    price: {type: Number, default: 0} // cat costa in plus daca bifezi asta
}, {_id: false});

const optionGroupSchema = new mongoose.Schema({
    type: {type: String, required: true}, // gen "topping" sau "size"
    name: {type: String, required: true}, // cum ii zicem la grupul asta de optiuni
    selectMultiple: {type: Boolean, default: false}, // daca poti bifa mai multe sau doar una
    items: [optionItemSchema] // lista de optiuni din grupul asta
}, {_id: false});

const foodSchema = new mongoose.Schema({
    name: {type:String,required:true}, // numele mancarii
    description: {type:String,required:true}, // ce scriem despre ea
    price: {type:Number,required:true}, // pretul de baza
    image: {type:String,required:true}, // numele pozei, nu poza in sine
    category: {type:String,required:true}, // in ce categorie intra (pizza, salata, etc)
    options: [optionGroupSchema] // aici bagam toate optiunile posibile
});

const foodModel = mongoose.models.food || mongoose.model("food",foodSchema);

export default foodModel;