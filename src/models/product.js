const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    discount: {
        type: Number,
        default: 0
    }
})

const Product = mongoose.model('Product', productSchema)

module.exports = Product