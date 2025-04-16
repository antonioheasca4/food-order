import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    isAdmin:{type:Boolean, default:false},
    cartData:{type:Object,default:{}},
    optionsData:{type:Object,default:{}},
    usedPromoCodes:{type:Array,default:[]}
},{minimize:false})

// Schema pentru emailuri șterse
const deletedEmailSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    deletedAt: { type: Date, default: Date.now }
});

const userModel = mongoose.model.user || mongoose.model("user",userSchema);
const DeletedEmail = mongoose.model("deletedEmail", deletedEmailSchema);

export default userModel;
export { DeletedEmail };