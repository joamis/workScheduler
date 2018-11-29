const mongoose = require('mongoose');

const Preference = new mongoose.Schema({
    nameOfSubject: {
        type: String,
        required: true,
        trim: true
    },
    groupID: {
        type: Number,
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
        required: true,
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