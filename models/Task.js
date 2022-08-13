const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    points: {
        type: Number,
        required: true,
    },
    taskId: {
        type: String,
        required: true,
    },
    currentUser: {
        type: String
    },
    status: {
        type: String,
        required: true,
    },
    serverName: {
        type: String,
        required: true,
    },
    serverId: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: new Date,
    }
})

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task