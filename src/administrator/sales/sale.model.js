import mongoose from "mongoose";

const saleSchema = new mongoose.Schema({
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ],
    saleDate: {
        type: Date,
        default: Date.now
    }
});

const Sale = mongoose.model('sale', saleSchema);


export default Sale;