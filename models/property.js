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

propertySchema.set('toJSON', {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;  
      delete ret.__v;
      return ret;
    }
});

module.exports = mongoose.model('Property', propertySchema);