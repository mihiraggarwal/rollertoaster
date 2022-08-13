const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    tasksCompleted: {
        type: Number,
    },
    currentTask: {
        type: String
    },
    points: {
        type: Number,
        required: true,
    },
    serverName: {
        type: String,
        required: true,
    },
    serverId: {
        type: String,
        required: true,
    }
})

const User = mongoose.model('User', UserSchema)

module.exports = User