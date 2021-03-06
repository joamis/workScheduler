const mongoose = require('mongoose');
const Preference = require('../models/Preference').PreferenceSchema;

const SubjectID = new mongoose.Schema({
    nameOfSubject: String,
    groupID: Number
})
const StudentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    surname: {
        type: String,
        required: true,
        trim: true
    },
    choices: [Preference],
    levelOfSatisfaction: {
        type: Number,
        required: false,
        default: 0
    },
    subjectsIds: [SubjectID],

    username: {
        type: String,
        unique : true,
        required: true
    }

});

const Student = mongoose.model('Student', StudentSchema);
module.exports = Student;