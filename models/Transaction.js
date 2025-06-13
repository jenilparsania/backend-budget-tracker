const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const userSchema = new Schema({
    username : String,
    password : String
})
const entitySchema = new Schema({
    type:"income" || "expense",
    amount : Number,
    category : String,
    date : Date,
    description : String,
    isRecurring : Boolean
});

// Create a model from the Schema
const EntityModel = mongoose.model("Entity",entitySchema);
const UserModel = mongoose.model("User",userSchema);
module.exports = {
    EntityModel,
    UserModel
}