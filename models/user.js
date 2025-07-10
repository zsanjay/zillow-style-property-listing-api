const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'INACTIVE'
    },
    properties : [{
        type : Schema.Types.ObjectId,
        ref : 'Property'
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);