const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    favorites:{
        type: []
    },
    created_at: {
        type: Date,
        default: Date.now,
    }

})

module.exports = mongoose.model("User", userSchema);