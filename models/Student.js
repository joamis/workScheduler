const mongoose = require('mongoose');

const Preference = new mongoose.Schema({
    nameOfSubject: {
        type: String,
        required: true,
        trim: true
    },
    groupID: {
        type: String,
        required: true,
        trim: true
    },
    numberOfPoints: {
        type: Number,
        default: 0,
        required: true,
        trim: true
    }
});

const StudentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    choices: [Preference],
    levelOfSatisfaction: {
        type: Number,
        required: true,
        default: 0
    },
    subjectsIds: [String]
});

const Student = mongoose.model('Student', StudentSchema);
module.exports = Student;