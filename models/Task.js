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
    currentUser: {
        type: String
    }
})

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task