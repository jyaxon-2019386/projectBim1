import mongoose from 'mongoose'

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product'
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    }
});

export default mongoose.model('cart', cartSchema)
