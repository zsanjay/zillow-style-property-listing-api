const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const propertySchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    address: {
        type: String,
        required: true
    },
    city: String,
    state: String,
    price: {
        type: Number,
        required: true
    },
    bedrooms: Number,
    bathrooms: Number,
    area_sqft: Number,
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);