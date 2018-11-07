const mongoose = require('mongoose');


const Group = new mongoose.Schema({
    date: Date,
    numberOfPeople: Number
});

const SubjectSchema = new mongoose.Schema({
    nameOfSubject: {
        type: String,
        required: true,
        trim: true
    },
    groups: [Group]
});


const Subject = mongoose.model('Subject', SubjectSchema);
module.exports = Subject;