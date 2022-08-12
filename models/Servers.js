const mongoose = require('mongoose');

const ServerSchema = new mongoose.Schema({
    serverName: {
        type: String,
        required: true,
    },
    serverId: {
        type: String,
        required: true,
    },
    memberInfo: {
        type: Object,
    },
    date: {
        type: Date,
        default: new Date,
    },
})

const Servers = mongoose.model('Servers', ServerSchema);

module.exports = Servers