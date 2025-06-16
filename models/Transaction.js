const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const entitySchema = new Schema({
    userId: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        required: true
    },
    isRecurring: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Create models from the Schemas
const EntityModel = mongoose.model("Entity", entitySchema);
const UserModel = mongoose.model("User", userSchema);

module.exports = {
    EntityModel,
    UserModel
};