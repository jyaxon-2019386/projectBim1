import mongoose from 'mongoose'

const purchaseHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    products: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'cancelled'],
        required: true
    }
});

export default mongoose.model('purchaseHistory', purchaseHistorySchema)
