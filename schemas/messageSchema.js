const mongoose = require("mongoose");
const {Schema} = require("mongoose");

const messageSchema = new mongoose.Schema({

    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    getter: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    message: {
        type: String,
    },
    seen:{
        type: Boolean,
        default: false,
    },
    created_at: {
        type: Date,
        default: Date.now,
    }

})

module.exports = mongoose.model("Message", messageSchema);