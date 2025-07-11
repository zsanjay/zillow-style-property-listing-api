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
    role: { 
        type: String, 
        enum: ['user', 'admin'],
        default: 'user'
    },
    properties: [{
        type: Schema.Types.ObjectId,
        ref: 'Property'
    }]
}, { timestamps: true });

userSchema.set('toJSON', {
    transform: function (doc, ret) {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('User', userSchema);