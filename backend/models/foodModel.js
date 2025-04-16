import mongoose from "mongoose";

const optionItemSchema = new mongoose.Schema({
    id: {type: String, required: true},
    name: {type: String, required: true},
    price: {type: Number, default: 0}
}, {_id: false});

const optionGroupSchema = new mongoose.Schema({
    type: {type: String, required: true},
    name: {type: String, required: true},
    selectMultiple: {type: Boolean, default: false},
    items: [optionItemSchema]
}, {_id: false});

const foodSchema = new mongoose.Schema({
    name: {type:String,required:true},
    description: {type:String,required:true},
    price: {type:Number,required:true},
    image: {type:String,required:true},
    category: {type:String,required:true},
    options: [optionGroupSchema]
});

const foodModel = mongoose.models.food || mongoose.model("food",foodSchema);

export default foodModel;