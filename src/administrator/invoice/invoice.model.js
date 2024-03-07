import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        required: true 
    },
    product: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'product',
        required: true 
    },
    price: {
        type: Number,
        required: true
    },
    date: { 
        type: Date, 
        default: Date.now 
    },
    totalAmount: { 
        type: Number, 
        required: true 
    },
}, {
    versionKey: false
}
);

export default mongoose.model('invoice', invoiceSchema)
