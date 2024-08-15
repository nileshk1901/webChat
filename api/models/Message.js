const mongoose = require('mongoose');

const MessageScehma = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    file:String,
}, { timestamps: true });

const MessageModel = mongoose.model('Message', MessageScehma);

module.exports = MessageModel;