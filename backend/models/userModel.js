// Model pentru user, aici bagam tot ce tine de conturi
// Avem si schema pentru emailuri sterse, ca sa nu se mai poata folosi la inregistrare

import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name:{type:String,required:true}, // numele userului
    email:{type:String,required:true,unique:true}, // emailul userului
    password:{type:String,required:true}, // parola, dar e hashuita
    isAdmin:{type:Boolean, default:false}, // daca e admin sau nu
    cartData:{type:Object,default:{}}, // ce are userul in cos
    optionsData:{type:Object,default:{}}, // optiunile selectate de user
    usedPromoCodes:{type:Array,default:[]} // coduri promo folosite
},{minimize:false})

// Schema pentru emailuri sterse, ca sa nu se mai poata folosi la inregistrare
const deletedEmailSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }, // email sters
    deletedAt: { type: Date, default: Date.now } // cand a fost sters
});

const userModel = mongoose.model.user || mongoose.model("user",userSchema);
const DeletedEmail = mongoose.model("deletedEmail", deletedEmailSchema);

export default userModel;
export { DeletedEmail };