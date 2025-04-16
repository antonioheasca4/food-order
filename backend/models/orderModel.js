import mongoose from "mongoose";

// Schema pentru un item din comandă
const orderItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    options: { type: Object, default: {} },
    totalPrice: { type: Number, required: true }
}, { _id: false });

// Schema pentru informații de livrare
const deliveryInfoSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true }
}, { _id: false });

// Schema principală pentru comandă
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    items: [orderItemSchema],
    deliveryInfo: deliveryInfoSchema,
    subtotal: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    },
    deliveryFee: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    promoCodeApplied: {
      type: String,
      default: null
    },
    notes: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order; 