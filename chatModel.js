var mongoose = require("mongoose");

var chatSchema = new mongoose.Schema({
    name: String,
    text: String,
    sid: String,
    date: String
    
});

module.exports = mongoose.model("Chat", chatSchema);